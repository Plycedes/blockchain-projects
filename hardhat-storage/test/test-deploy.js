const { ethers } = require("hardhat");
const { assert } = require("chai");

describe("Storage", function () {
    let storageFactory;
    let storage;

    beforeEach(async function () {
        storageFactory = await ethers.getContractFactory("Storage");
        storage = await storageFactory.deploy();
    });

    it("Should start with a favorite number of 0", async function () {
        const initialValue = await storage.retrive();
        const expectedValue = "0";
        assert.equal(initialValue.toString(), expectedValue);
    });
    it("Should update when store is called", async function () {
        const expectedValue = "69";
        const transactionResponse = await storage.store(expectedValue);
        await transactionResponse.wait(1);
        const newValue = await storage.retrive();
        assert.equal(newValue.toString(), expectedValue);
    });
    it("Should save data in array and map name to number", async function () {
        const name = "Luffy",
            number = 69;
        const transactionResponse = await storage.addPerson(number, name);
        await transactionResponse.wait(1);
        const favNum = await storage.favNumQuery(name);
        assert.equal(number, favNum);
    });
});
