const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { assert, expect } = require("chai");

describe("NovoFund", async function () {
    let novoFund;
    let deployer;
    let mockV3Aggregator;
    const sendValue = ethers.utils.parseEther("1");

    beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        novoFund = await ethers.getContract("NovoFund", deployer);
        mockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator",
            deployer
        );
    });

    describe("constructor", async function () {
        it("sets the aggregator addresses correctly", async function () {
            const response = await novoFund.priceFeed();
            assert.equal(response, mockV3Aggregator.address);
        });
    });

    describe("receive", async function () {
        it("Calls fund function", async function () {
            await expect(novoFund.fund());
        });
    });

    describe("fallback", async function () {
        it("Calls fund function", async function () {
            await expect(novoFund.fund());
        });
    });

    describe("fund", async function () {
        it("Fails if you don't send enough ETH", async function () {
            await expect(novoFund.fund()).to.be.reverted;
        });
        it("Updates the amount funded data structure", async function () {
            await novoFund.fund({ value: sendValue });
            const response = await novoFund.addressToAmountFunded(deployer);
            assert.equal(response.toString(), sendValue.toString());
        });
        it("Adds funder to funders array", async function () {
            await novoFund.fund({ value: sendValue });
            const funder = await novoFund.funders(0);
            assert.equal(funder, deployer);
        });
    });

    describe("withdraw", async function () {
        this.beforeEach(async function () {
            await novoFund.fund({ value: sendValue });
        });

        it("Withdraw ETH from a single founder", async function () {
            const startingNovoFundBalance = await novoFund.provider.getBalance(
                novoFund.address
            );
            const startingDeployerBalance = await novoFund.provider.getBalance(
                deployer
            );
            const transactionRespone = await novoFund.withdraw();
            const transactionReciept = await transactionRespone.wait(1);
            const { gasUsed, effectiveGasPrice } = transactionReciept;
            const gasCost = gasUsed.mul(effectiveGasPrice);

            const endingNovoFundBalance = await novoFund.provider.getBalance(
                novoFund.address
            );
            const endingDeployerBalance = await novoFund.provider.getBalance(
                deployer
            );
            assert.equal(endingNovoFundBalance, 0);
            assert.equal(
                startingNovoFundBalance.add(startingDeployerBalance).toString(),
                endingDeployerBalance.add(gasCost).toString()
            );
        });
    });
});
