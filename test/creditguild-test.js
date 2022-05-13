const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CreditGuild", function () {
    
    let membershipFee = 20;
    let vouchAmout = 1;
    let marketRegistry = "0x4ABAb00eae341cF2E79D2ae35455749F10B39dEC";
    let unionToken = "0x16e3271d3A8F0d0ef4F9d06De9f805eB34885b39";
    let underlyingToken = "0x453814a3f8e5F4bBE40948B7F22fd658Edd76101";


    before(async function () {
        // [ADMIN, ALICE, BOB, TOM, MEMBER1, MEMBER2, MEMBER3, MEMBER4, APP, PROXY_ADMIN] = await ethers.getSigners();
        console.log('hi')
        const CreditGuild = await ethers.getContractFactory("CreditGuild");
        console.log('hi')

        creditGuild = await CreditGuild.deploy(
            membershipFee,
            vouchAmout,
            marketRegistry,
            unionToken,
            underlyingToken
        );
        console.log('hi')

        // await creditGuild.deployed();

        // [address0] = await ethers.getSigners();

        // sup_DaoAddress = creditGuild.address;
    });

    beforeEach(async function () {

    });

    describe("Initialize", function () {

        it("Should initialize first 3 members", async function () {
            // creditGuild.initialize(ALICE, BOB, TOM);
        });
    });


});
