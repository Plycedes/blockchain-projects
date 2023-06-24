const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { assert } = require("chai");

describe("NovoFund", async function () {
    let novoFund;
    let deployer;
    let mockV3Aggregator;
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
});
