const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
  
    console.log(
        "Deploying contracts with the account:",
        deployer.address
    );

    const Vault = await ethers.getContractFactory("Vault");
    const vaultContract = await Vault.deploy();
    await vaultContract.waitForDeployment();

    console.log("Vault contract dedployed to:", vaultContract.target);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
