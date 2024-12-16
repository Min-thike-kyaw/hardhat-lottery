const { network, ethers } = require('hardhat')
const {
    networkConfig,
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS
} = require('../helper-hardhat.config');
const { verify } = require('../utils/verify');
module.exports = async ({ getNamedAccounts , deployments }) => {
    const { log, deploy } = deployments
    const { deployer } = await getNamedAccounts()

    const chainId = network.config.chainId

    let subscriptionId,vrfCoordinatorV2Address,vrfCoordinatorV2Mock, vrfCoordinatorV2MockDeployment
    if(chainId === 31337) {
        vrfCoordinatorV2MockDeployment = await deployments.get("VRFCoordinatorV2Mock");
        vrfCoordinatorV2Mock = await ethers.getContractAt("VRFCoordinatorV2Mock", vrfCoordinatorV2MockDeployment.address)
        vrfCoordinatorV2Address = vrfCoordinatorV2MockDeployment.address
        const transactionResponse = await vrfCoordinatorV2Mock.createSubscription()
        const transactionReceipt = await transactionResponse.wait()
        log("-------Subscription ID---------")
        log(transactionReceipt.logs[0].args.subId)
        subscriptionId = transactionReceipt.logs[0].args.subId// transactionReceipt.events[0].args.subId
    } else {
        subscriptionId = BigInt(networkConfig[chainId].subscriptionId)
        vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2
    }

    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : VERIFICATION_BLOCK_CONFIRMATIONS

    const args = [
        vrfCoordinatorV2Address,
        // subscriptionId,
        networkConfig[chainId]["gasLane"],
        networkConfig[chainId]["keepersUpdateInterval"],
        networkConfig[chainId]["raffleEntranceFee"],
        networkConfig[chainId]["callbackGasLimit"],
    ]

    log({
        log: true,
        from: deployer,
        args,
        waitConfirmations: waitBlockConfirmations,
    })
    const raffle = await deploy('Raffle', {
        log: true,
        from: deployer,
        args,
        waitConfirmations: waitBlockConfirmations,
    })

    // Ensure the Raffle contract is a valid consumer of the VRFCoordinatorV2Mock contract.
    if (developmentChains.includes(network.name)) {
        const vrfCoordinatorV2Mock = await ethers.getContractAt("VRFCoordinatorV2Mock", vrfCoordinatorV2MockDeployment.address)
        await vrfCoordinatorV2Mock.addConsumer(subscriptionId, raffle.address)
    }

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(raffle.address, args)
    }

    log("Enter lottery with command:")
    const networkName = network.name == "hardhat" ? "localhost" : network.name
    log(`yarn hardhat run scripts/enterRaffle.js --network ${networkName}`)
    log("----------------------------------------------------")
}