# Vault contract

This is a Vault smart-contract, written in Solidity and suitable for deployment on Ethereum. The Vault provides the following functionality:

* Users may deposit and later withdraw ETH. They may not withdraw more than they have individually deposited (no negative balances).
* Users may deposit and withdraw ERC20 tokens of their choosing. Again, they may not withdraw more than they have deposited of a given token.
* After depositing ETH, users may wrap their ETH into WETH within the vault (i.e. without first withdrawing). Similarly, users may unwrap their WETH into ETH within the vault.

## Setup
1. Clone the repository and navigate to the project directory:
```bash
git clone https://github.com/lexaisnotdead/vault-predexyo.git
cd ./vault-predexyo
```
2. Install the project dependencies:
```bash
npm install
```
3. Create a new ```.env``` file in the project directory with the following variables:
```bash
INFURA_API_KEY = <your_infura_project_id>
PRIVATE_KEY = <your_private_key>
ETHERSCAN_API_KEY = <your_etherscan_api_key>
```
## Usage
To run the tests, simply execute the following command:
```bash
npx hardhat test
```

To deploy the contract to a local network, execute the following commands:
```bash
npx hardhat node
npx hardhat run scripts/deploy-vault.js --network localhost
```
Replace ```localhost``` with the name of the network you want to deploy to (e.g. goerli, mainnet, etc.) and make sure you have the corresponding configuration in the `hardhat.config.js` file.

## Links

[Link to the verified contract in the Goerli network:](https://goerli.etherscan.io/address/0xc3e59922D81edD0BA72495c2c53144441d074fC9#code)