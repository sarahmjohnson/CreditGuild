const { ethers } = require("hardhat");
const { expect } = require("chai");
require("chai").should();

describe("CreditGuild", function () {
  let MEMBERSHIPFEE = ethers.utils.parseEther("1");
  let VOUCHAMOUNT = ethers.utils.parseEther("1");

    before(async function () {
        [TIMELOCK, NOUNS, VETOER, JACK, MEMBER1, MEMBER2, MEMBER3] = await ethers.getSigners();

        const NounsDAOLogicV1 = await ethers.getContractFactory("NounsDAOLogicV1");
        nounsDAOLogicV1 = await NounsDAOLogicV1.deploy();

    });


    describe("Initialize", function () {
        it("Should initialize the governance", async function () {

            const tx = await nounsDAOLogicV1.initialize(
            TIMELOCK,
            NOUNS,
            VETOER,
            5_760,
            1,
            1,
            200
            );

            const resp = await tx.wait();
            result = resp.events[resp.events.length - 1].args.votingPeriodSet;

            console.log(result);
        });
    });
});
