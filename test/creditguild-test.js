const {ethers} = require("hardhat");
const {expect} = require("chai");
require("chai").should();

describe("CreditGuild", function () {
    
    let MEMBERSHIPFEE = ethers.utils.parseEther("1");
    let VOUCHAMOUNT = 1;

    before(async function () {
        
        [ADMIN, ALICE, BOB, TOM, JACK, MEMBER1, MEMBER2, MEMBER3, USERMANAGER] = await ethers.getSigners();
        
        const MarketRegistry = await ethers.getContractFactory("MarketRegistryMock");
        const marketRegistry = await MarketRegistry.deploy(); 
        const MockERC20 = await ethers.getContractFactory("FaucetERC20"); 

        // deploy underlyingToken
        const underlyingToken = await MockERC20.deploy(); 
        underlyingToken.mint(ADMIN, 100 * 10 ** 18); // min 100 DAI (underlying) 
        const underlyingAddress = underlyingToken.address; 

        // deploy uToken
        const uToken = await MockERC20.deploy(); 
        uToken.mint(ADMIN, 100 * 10 ** 18); 
        const uTokenAddress = uToken.address; 

        console.log("marketRegistry address: ", marketRegistry.address)
        console.log("userManager address: ", USERMANAGER.address)

        // add mockUtoken contract for the mock underlying token (DAI) 
        await marketRegistry.addUToken(underlyingAddress, uTokenAddress);
        await marketRegistry.addUserManager(underlyingAddress, USERMANAGER.address);

        // deploy creditGuild
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

            console.log("member1: ", MEMBER1.address)
            await creditGuild.initialize(MEMBER1.address, MEMBER2.address, MEMBER3.address);
            
        });
    });

    describe("SetMembershipFee", function () {

        it("Should set membership fee", async function () {

            // membershipFee should be set to the amount provided in the constructor
            const initialMembershipFee = await creditGuild.membershipFee();
            expect(MEMBERSHIPFEE).to.equal(initialMembershipFee);

            // happy path - test changing the fee with the setMembershipFee function
            const newMembershipFee = ethers.utils.parseEther("200")
            await creditGuild.setMembershipFee(newMembershipFee);
            const membershipFee = await creditGuild.membershipFee();
            expect(membershipFee).to.equal(newMembershipFee);

            // unhappy path - test revert when onlyOwner fails

        });
    });

    describe("SetVouchAmount", function () {

        it("Should set vouch amount", async function () {

            // vouchAmount should be set to the amount provided in the constructor
            const initialVouchAmount = await creditGuild.vouchAmount();
            expect(VOUCHAMOUNT).to.equal(initialVouchAmount);

            // happy path - test changing the vouch amount with the setVouchAmount function
            const newVouchAmount = ethers.utils.parseEther("50");
            await creditGuild.setVouchAmount(newVouchAmount);
            const vouchAmount = await creditGuild.vouchAmount();
            expect(vouchAmount).to.equal(newVouchAmount);

            // unhappy path - test revert when onlyOwner fails

        });
    });

    describe("CheckIsMember", function () {

        it("Should check if address is a member", async function () {
            // await creditGuild.initialize(ALICE.address, BOB.address, TOM.address);

            // Alice should be a member
            // const potentialMember = ALICE.address;
            // const tx = await creditGuild.checkIsMember(potentialMember);
            // const resp = await tx.wait();
            // result = resp.events[resp.events.length - 1].args.result;

            // tokenId = resp.events[resp.events.length - 1].args.tokenId;
            // expect(await tokenId).to.equal(true);
            // expect(member).to.equal(true);

            // Jose should not be a member
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
            // unhappy path - should revert because there are not 3 members in the guild
            // await creditGuild.register([MEMBER1.address, MEMBER2.address, MEMBER3.address]);

            // unhappy path - members are not vouching for msg.sender

            // unhappy path - one of the addresses passed in is not a member
            // await creditGuild.initialize(MEMBER1.address, MEMBER2.address, MEMBER3.address);
            // all 3 members need to vouch for msg.sender
            // await creditGuild.register([MEMBER1.address, MEMBER2.address, MEMBER3.address]);
            // check that ALICE is now a member

            // happy path
            // await creditGuild.initialize(MEMBER1.address, MEMBER2.address, MEMBER3.address);
            // all 3 members need to vouch for msg.sender
            // await creditGuild.register([MEMBER1.address, MEMBER2.address, MEMBER3.address]);
            // check that ALICE is now a member

            // unhappy path - should revert because msg.sender is already a member
            // await creditGuild.register([MEMBER1.address, MEMBER2.address, MEMBER3.address]);

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
