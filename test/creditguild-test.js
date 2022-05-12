const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CreditGuild", function () {
    
    let membershipFee = 20;
    let creditGuild;
    let address0;
    let address1;
    let address2;
    let address3;

    before(async function () {
        [ADMIN, ALICE, BOB, TOM, MEMBER1, MEMBER2, MEMBER3, MEMBER4, APP, PROXY_ADMIN] = await ethers.getSigners();

        // userManager.registerMember(ALICE);
        // userManager.registerMember(BOB);
        // userManager.registerMember(TOM);

        items = await ethers.getSigners();
        const CreditGuild = await ethers.getContractFactory("UserManagerMock");
        creditGuild = await CreditGuild.deploy(membershipFee);
        await creditGuild.deployed();

        [address0] = await ethers.getSigners();

        sup_DaoAddress = creditGuild.address;
    });

    beforeEach(async function () {

    });

    describe("Initialize", function () {

        it("Should initialize first 3 members", async function () {
            creditGuild.initialize(ALICE, BOB, TOM);
        });
    });


});
