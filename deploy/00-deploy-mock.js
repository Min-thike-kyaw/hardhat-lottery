const { network } = require('hardhat')

const BASE_FEE = "250000000000000000" // 0.25 is this the premium in LINK?
const GAS_PRICE_LINK = 1e9 // link per gas, is this the gas lane? // 0.000000001 LINK per gas

module.exports = async ({deployments, getNamedAccounts}) => {
    const {log, deploy} = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // 0x45D67C6cDcDa9c859EcCD11fF5C96134Ac1799cA
    if(chainId === 31337) {
        log("Local network detected! Deploying mocks...")
        await deploy('VRFCoordinatorV2Mock', {
            from: deployer,
            log: true,
            args : [BASE_FEE, GAS_PRICE_LINK]
        })

        log("Mocks Deployed!")
        log("----------------------------------------------------------")
    }
}

module.exports.tags = ["all", "mocks"]