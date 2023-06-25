const { getNamedAccounts } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");
const { assert } = require("chai");

developmentChains.includes(network.name)
    ? describe.skip
    : describe("NovoFund", async function () {
          let novoFund;
          let deployer;
          const sendValue = ethers.utils.parseEther("0.1");

          this.beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer;
              novoFund = await ethers.getContract("NovoFund", deployer);
          });

          it("Allows people to fund and withdraw", async function () {
              await novoFund.fund({ value: sendValue });
              await novoFund.withdraw();
              const endingNovoFundBalance = await novoFund.provider.getBalance(
                  novoFund.address
              );
              assert.equal(endingNovoFundBalance.toString(), "0");
          });
      });
