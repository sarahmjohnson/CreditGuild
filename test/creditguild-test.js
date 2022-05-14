const {ethers, upgrades, waffle} = require("hardhat");
const {expect} = require("chai");
require("chai").should();
const {parseEther} = require("ethers").utils;

const AddressZero = ethers.constants.AddressZero;

describe("CreditGuild", function () {
    
    let MEMBERSHIPFEE = ethers.utils.parseEther("1");
    let VOUCHAMOUNT = 1;

    before(async function () {
        
        [ADMIN, ALICE, BOB, TOM, JACK, MEMBER1, MEMBER2, MEMBER3, USERMANAGER] = await ethers.getSigners();
        
        const MarketRegistry = await ethers.getContractFactory("MarketRegistryMock");
        const marketRegistry = await MarketRegistry.deploy(); 
        const MockERC20 = await ethers.getContractFactory("FaucetERC20"); 

        // initialize underlyingToken
        const underlyingToken = await MockERC20.deploy(); 
        underlyingToken.mint(ADMIN, 100 * 10 ** 18); // min 100 DAI (underlying) 
        const underlyingAddress = underlyingToken.address; 

        // initialize uToken
        const uToken = await MockERC20.deploy(); 
        uToken.mint(ADMIN, 100 * 10 ** 18); 
        const uTokenAddress = uToken.address; 

        console.log("marketRegistry address: ", marketRegistry.address)
        console.log("userManager address: ", USERMANAGER.address)

        // this adds the mockUtoken contract for the mock underlying token (DAI) 
        await marketRegistry.addUToken(underlyingAddress, uTokenAddress);
        await marketRegistry.addUserManager(underlyingAddress, USERMANAGER.address);

        const CreditGuild = await ethers.getContractFactory("CreditGuild");

        creditGuild = await CreditGuild.deploy(
            MEMBERSHIPFEE,
            VOUCHAMOUNT,
            marketRegistry.address,
            uTokenAddress,
            underlyingAddress
        );


    });

    describe("Initialize", function () {

        it("Should initialize first 3 members", async function () {
            console.log("member1: ",MEMBER1.address)
            await creditGuild.initialize(MEMBER1.address, MEMBER2.address, MEMBER3.address);
        });
    });

    describe("SetMembershipFee", function () {

        it("Should set membership fee", async function () {

            const initialMembershipFee = await creditGuild.membershipFee();
            expect(MEMBERSHIPFEE).to.equal(initialMembershipFee);

            const newMembershipFee = ethers.utils.parseEther("200")
            await creditGuild.setMembershipFee(newMembershipFee);
            const membershipFee = await creditGuild.membershipFee();
            expect(membershipFee).to.equal(newMembershipFee);
        });
    });

    describe("SetVouchAmount", function () {

        it("Should set vouch amount", async function () {

            const initialVouchAmount = await creditGuild.vouchAmount();
            expect(VOUCHAMOUNT).to.equal(initialVouchAmount);

            const newVouchAmount = ethers.utils.parseEther("50");
            await creditGuild.setVouchAmount(newVouchAmount);
            const vouchAmount = await creditGuild.vouchAmount();
            expect(vouchAmount).to.equal(newVouchAmount);
        });
    });

    describe("CheckIsMember", function () {

        it("Should check if address is a member", async function () {
            // await creditGuild.initialize(ALICE.address, BOB.address, TOM.address);


            // happy path
            // const potentialMember = ALICE.address;
            // const tx = await creditGuild.checkIsMember(potentialMember);
            // const resp = await tx.wait();
            // result = resp.events[resp.events.length - 1].args.result;

            // tokenId = resp.events[resp.events.length - 1].args.tokenId;
            // expect(await tokenId).to.equal(true);
            // expect(member).to.equal(true);

            // unhappy path
            // const potentialMember2 = JOSE.address;
            // const tx2 = await creditGuild.checkIsMember(potentialMember2);
            // const resp2 = await tx2.wait();
            // console.log(resp2)
            // tokenId = resp.events[resp.events.length - 1].args.tokenId;


        });
    });
    // register, claim vouch, stake, mintNFT, _beforeTokenTransfer

    describe("Register", function () {

        it("Should register an array of members", async function () {

            // await creditGuild.register([ALICE.address]);

            // check that ALICE is now a member

        });
    });

    describe("Claim Vouch", function () {

        it("Should allow an address to claim a vouch", async function () {

            // await creditGuild.claimVouch();
            //check creditGuild.vouchAmount()

        });
    });

    describe("Burn Membership", function () {

        it("Should burn a membership to the DAO", async function () {

            // await creditGuild.burnMembership(MEMBER1.address);
            //check creditGuild.checkIsMember(MEMBER1.address)

        });
    });

});
