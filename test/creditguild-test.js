const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CreditGuild", function () {
    
    // let userManager;
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
        const CreditGuild = await ethers.getContractFactory("CreditGuildMock");
        creditGuild = await CreditGuild.deploy(
            ALICE,
            BOB,
            TOM
        );
        await creditGuild.deployed();

        [address0] = await ethers.getSigners();

        sup_DaoAddress = creditGuild.address;c
    });

    beforeEach(async function () {



        // Create member and ad

    });

    describe("Endorse", function () {

        it("Existing DAO member should endorse a new member", async function () {

            // const tx = await hardhatSup_Dao.endorse(
            //     ROYALTY
            // )
            // const resp = await tx.wait();
    
            // tokenId = resp.events[resp.events.length - 1].args.tokenId;

            // expect(await tokenId).to.equal(1);

            // royaltyAddress, royaltyArray = await hardhatNFT.royaltyInfo(tokenId, SALEPRICE);
            // expect(this.address).to.equal(royaltyAddress);
            
            // royaltyToMatch = royaltyArray[1]/SALEPRICE;
            // expect(ROYALTY).to.equal(royaltyToMatch*100);

        });
    });


});
