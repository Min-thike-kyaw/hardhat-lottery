const { run } = require("hardhat")

const verify = async (contractAddress, args) => {
  console.log("Verifying contract state...")
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    })
    console.log("Sucessfully Verified")
  } catch (e) {
    console.log(e)
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Already verified!")
    } else {
      console.log(e)
    }
  }
}

module.exports = { verify }