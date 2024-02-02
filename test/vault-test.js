const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Vault", function () {
    let Vault;
    let vaultContract;

    let owner;
    let alice;
    let bob;

    const amount = ethers.parseEther("1");
    const ethAddress = ethers.ZeroAddress;

    before(async function() {
        [owner, alice, bob] = await ethers.getSigners();

        console.log("Owner:", owner.address);
        console.log("Alice:", alice.address);
        console.log("Bob:", bob.address);

        Vault = await ethers.getContractFactory("Vault");
    });

    beforeEach(async function() {
        vaultContract = await Vault.deploy();
        await vaultContract.waitForDeployment();
    });

    it("Should allow to deposit native coins", async function() {
        const tx1 = await vaultContract.connect(alice).deposit(ethAddress, amount, {value: amount});
        const tx2 = await vaultContract.connect(bob).deposit(ethAddress, amount, {value: amount});

        expect(tx1).to.emit(vaultContract, "Deposit").withArgs(
            alice.address,
            ethAddress,
            amount
        );

        expect(tx2).to.emit(vaultContract, "Deposit").withArgs(
            bob.address,
            ethAddress,
            amount
        );

        expect(await vaultContract.nativeCoinDeposits(alice.address)).to.equal(amount);
        expect(await vaultContract.nativeCoinDeposits(bob.address)).to.equal(amount);
    });

    it ("Should allow to deposit erc-20 tokens", async function() {
        const TetherUSD = await ethers.getContractFactory("TestERC20");
        const USDT = await TetherUSD.deploy("Tether USD", "USDT");
        await USDT.waitForDeployment();

        await USDT.transfer(alice.address, amount);
        await USDT.transfer(bob.address, amount);

        expect(await USDT.balanceOf(alice.address)).to.equal(amount);
        expect(await USDT.balanceOf(bob.address)).to.equal(amount);

        await USDT.connect(alice).approve(vaultContract.target, amount);
        await USDT.connect(bob).approve(vaultContract.target, amount);

        expect(await USDT.allowance(alice.address, vaultContract.target)).to.equal(amount);
        expect(await USDT.allowance(bob.address, vaultContract.target)).to.equal(amount);

        const tx1 = await vaultContract.connect(alice).deposit(USDT.target, amount);
        const tx2 = await vaultContract.connect(bob).deposit(USDT.target, amount);

        expect(tx1).to.emit(vaultContract, "Deposit").withArgs(
            alice.address,
            USDT.target,
            amount
        );

        expect(tx2).to.emit(vaultContract, "Deposit").withArgs(
            bob.address,
            USDT.target,
            amount
        );

        expect(await vaultContract.tokenDeposits(alice.address, USDT.target)).to.equal(amount);
        expect(await vaultContract.tokenDeposits(bob.address, USDT.target)).to.equal(amount);
    });

    it("Should allow to withdraw deposited native coins", async function() {
        const tx1 = await vaultContract.connect(alice).deposit(ethAddress, amount, {value: amount});
        const tx2 = await vaultContract.connect(bob).deposit(ethAddress, amount, {value: amount});

        expect(tx1).to.emit(vaultContract, "Deposit").withArgs(
            alice.address,
            ethAddress,
            amount
        );

        expect(tx2).to.emit(vaultContract, "Deposit").withArgs(
            bob.address,
            ethAddress,
            amount
        );

        expect(await vaultContract.nativeCoinDeposits(alice.address)).to.equal(amount);
        expect(await vaultContract.nativeCoinDeposits(bob.address)).to.equal(amount);

        const tx3 = await vaultContract.connect(alice).withdraw(ethAddress, amount);
        const tx4 = await vaultContract.connect(bob).withdraw(ethAddress, amount);

        expect(tx3).to.emit(vaultContract, "Withdraw").withArgs(
            alice.address,
            ethAddress,
            amount
        );

        expect(tx4).to.emit(vaultContract, "Withdraw").withArgs(
            bob.address,
            ethAddress,
            amount
        );

        expect(await vaultContract.nativeCoinDeposits(alice.address)).to.equal(0);
        expect(await vaultContract.nativeCoinDeposits(bob.address)).to.equal(0);
    });

    it("Should allow to withdraw deposited erc-20 tokens", async function() {
        const TetherUSD = await ethers.getContractFactory("TestERC20");
        const USDT = await TetherUSD.deploy("Tether USD", "USDT");
        await USDT.waitForDeployment();

        await USDT.transfer(alice.address, amount);
        await USDT.transfer(bob.address, amount);

        expect(await USDT.balanceOf(alice.address)).to.equal(amount);
        expect(await USDT.balanceOf(bob.address)).to.equal(amount);

        await USDT.connect(alice).approve(vaultContract.target, amount);
        await USDT.connect(bob).approve(vaultContract.target, amount);

        expect(await USDT.allowance(alice.address, vaultContract.target)).to.equal(amount);
        expect(await USDT.allowance(bob.address, vaultContract.target)).to.equal(amount);

        const tx1 = await vaultContract.connect(alice).deposit(USDT.target, amount);
        const tx2 = await vaultContract.connect(bob).deposit(USDT.target, amount);

        expect(tx1).to.emit(vaultContract, "Deposit").withArgs(
            alice.address,
            USDT.target,
            amount
        );

        expect(tx2).to.emit(vaultContract, "Deposit").withArgs(
            bob.address,
            USDT.target,
            amount
        );

        expect(await vaultContract.tokenDeposits(alice.address, USDT.target)).to.equal(amount);
        expect(await vaultContract.tokenDeposits(bob.address, USDT.target)).to.equal(amount);

        const tx3 = await vaultContract.connect(alice).withdraw(USDT.target, amount);
        const tx4 = await vaultContract.connect(bob).withdraw(USDT.target, amount);

        expect(tx3).to.emit(vaultContract, "Withdraw").withArgs(
            alice.address,
            USDT.target,
            amount
        );

        expect(tx4).to.emit(vaultContract, "Withdraw").withArgs(
            bob.address,
            USDT.target,
            amount
        );

        expect(await vaultContract.tokenDeposits(alice.address, USDT.target)).to.equal(0);
        expect(await vaultContract.tokenDeposits(bob.address, USDT.target)).to.equal(0);
    });

    it("Should not allow to withdraw more native coins than they have deposited", async function() {
        const tx1 = await vaultContract.connect(alice).deposit(ethAddress, amount, {value: amount});
        const tx2 = await vaultContract.connect(bob).deposit(ethAddress, amount, {value: amount});

        expect(tx1).to.emit(vaultContract, "Deposit").withArgs(
            alice.address,
            ethAddress,
            amount
        );

        expect(tx2).to.emit(vaultContract, "Deposit").withArgs(
            bob.address,
            ethAddress,
            amount
        );

        expect(await vaultContract.nativeCoinDeposits(alice.address)).to.equal(amount);
        expect(await vaultContract.nativeCoinDeposits(bob.address)).to.equal(amount);

        await expect(vaultContract.connect(alice).withdraw(ethAddress, amount + 1n)).to.be.reverted;
        await expect(vaultContract.connect(bob).withdraw(ethAddress, amount + 1n)).to.be.reverted;
    });

    it("Should not allow to withdraw more erc-20 tokens than they have deposited", async function() {
        const TetherUSD = await ethers.getContractFactory("TestERC20");
        const USDT = await TetherUSD.deploy("Tether USD", "USDT");
        await USDT.waitForDeployment();

        await USDT.transfer(alice.address, amount);
        await USDT.transfer(bob.address, amount);

        expect(await USDT.balanceOf(alice.address)).to.equal(amount);
        expect(await USDT.balanceOf(bob.address)).to.equal(amount);

        await USDT.connect(alice).approve(vaultContract.target, amount);
        await USDT.connect(bob).approve(vaultContract.target, amount);

        expect(await USDT.allowance(alice.address, vaultContract.target)).to.equal(amount);
        expect(await USDT.allowance(bob.address, vaultContract.target)).to.equal(amount);

        const tx1 = await vaultContract.connect(alice).deposit(USDT.target, amount);
        const tx2 = await vaultContract.connect(bob).deposit(USDT.target, amount);

        expect(tx1).to.emit(vaultContract, "Deposit").withArgs(
            alice.address,
            USDT.target,
            amount
        );

        expect(tx2).to.emit(vaultContract, "Deposit").withArgs(
            bob.address,
            USDT.target,
            amount
        );

        expect(await vaultContract.tokenDeposits(alice.address, USDT.target)).to.equal(amount);
        expect(await vaultContract.tokenDeposits(bob.address, USDT.target)).to.equal(amount);

        await expect(vaultContract.connect(alice).withdraw(USDT.target, amount + 1n)).to.be.reverted;
        await expect(vaultContract.connect(bob).withdraw(USDT.target, amount + 1n)).to.be.reverted;
    });

    it("Should allow to wrap deposited eth", async function() {
        const tx1 = await vaultContract.connect(alice).deposit(ethAddress, amount, {value: amount});
        const tx2 = await vaultContract.connect(bob).deposit(ethAddress, amount, {value: amount});

        expect(tx1).to.emit(vaultContract, "Deposit").withArgs(
            alice.address,
            ethAddress,
            amount
        );

        expect(tx2).to.emit(vaultContract, "Deposit").withArgs(
            bob.address,
            ethAddress,
            amount
        );

        expect(await vaultContract.nativeCoinDeposits(alice.address)).to.equal(amount);
        expect(await vaultContract.nativeCoinDeposits(bob.address)).to.equal(amount);

        const tx3 = await vaultContract.connect(alice).wrap(amount);
        const tx4 = await vaultContract.connect(bob).wrap(amount);

        expect(tx3).to.emit(vaultContract, "Wrap").withArgs(
            alice.address,
            amount
        );

        expect(tx4).to.emit(vaultContract, "Wrap").withArgs(
            bob.address,
            amount
        );

        expect(await vaultContract.nativeCoinDeposits(alice.address)).to.equal(0);
        expect(await vaultContract.nativeCoinDeposits(bob.address)).to.equal(0);

        expect(await vaultContract.balanceOf(alice.address)).to.equal(amount);
        expect(await vaultContract.balanceOf(bob.address)).to.equal(amount);
    });

    it("Should allow to unwrap wrapped eth", async function() {
        const tx1 = await vaultContract.connect(alice).deposit(ethAddress, amount, {value: amount});
        const tx2 = await vaultContract.connect(bob).deposit(ethAddress, amount, {value: amount});

        expect(tx1).to.emit(vaultContract, "Deposit").withArgs(
            alice.address,
            ethAddress,
            amount
        );

        expect(tx2).to.emit(vaultContract, "Deposit").withArgs(
            bob.address,
            ethAddress,
            amount
        );

        expect(await vaultContract.nativeCoinDeposits(alice.address)).to.equal(amount);
        expect(await vaultContract.nativeCoinDeposits(bob.address)).to.equal(amount);

        const tx3 = await vaultContract.connect(alice).wrap(amount);
        const tx4 = await vaultContract.connect(bob).wrap(amount);

        expect(tx3).to.emit(vaultContract, "Wrap").withArgs(
            alice.address,
            amount
        );

        expect(tx4).to.emit(vaultContract, "Wrap").withArgs(
            bob.address,
            amount
        );

        expect(await vaultContract.nativeCoinDeposits(alice.address)).to.equal(0);
        expect(await vaultContract.nativeCoinDeposits(bob.address)).to.equal(0);

        expect(await vaultContract.balanceOf(alice.address)).to.equal(amount);
        expect(await vaultContract.balanceOf(bob.address)).to.equal(amount);

        const tx5 = await vaultContract.connect(alice).unwrap(amount);
        const tx6 = await vaultContract.connect(bob).unwrap(amount);

        expect(tx5).to.emit(vaultContract, "Unwrap").withArgs(
            alice.address,
            amount
        );

        expect(tx6).to.emit(vaultContract, "Unwrap").withArgs(
            bob.address,
            amount
        );

        expect(await vaultContract.nativeCoinDeposits(alice.address)).to.equal(amount);
        expect(await vaultContract.nativeCoinDeposits(bob.address)).to.equal(amount);

        expect(await vaultContract.balanceOf(alice.address)).to.equal(0);
        expect(await vaultContract.balanceOf(bob.address)).to.equal(0);
    });
});