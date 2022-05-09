// const { expect } = require("chai");
// const { ethers } = require("hardhat");

// const ADDRESS1 = 0x9F52436F53A141341EAf9b590601C0EC48B7Cb36;
// const ADDRESS2 = 0x3a077484680d03408d6Bd958E5e8523D5Bf76466;
// const ADDRESS3 = 0xb1d52c42FBF8171327cEC0eCA3D698447900eF58;

// describe("SupDao", function () {
    
//     let hardhatSup_Dao;

//     beforeEach(async function () {

//         items = await ethers.getSigners();
//         const HardhatSup_Dao = await ethers.getContractFactory("SupDao");
//         hardhatSup_Dao = await HardhatSup_Dao.deploy(
//             ADDRESS1,
//             ADDRESS2,
//             ADDRESS3
//         );
//         await hardhatSup_Dao.deployed();

//         [address1] = await ethers.getSigners();

//         sup_DaoAddress = hardhatSup_Dao.address;

//         // Create member and ad

//     });

//     describe("Endorse", function () {

//         it("Existing DAO member should endorse a new member", async function () {

//             // const tx = await hardhatSup_Dao.endorse(
//             //     ROYALTY
//             // )
//             // const resp = await tx.wait();
    
//             // tokenId = resp.events[resp.events.length - 1].args.tokenId;

//             // expect(await tokenId).to.equal(1);

//             // royaltyAddress, royaltyArray = await hardhatNFT.royaltyInfo(tokenId, SALEPRICE);
//             // expect(this.address).to.equal(royaltyAddress);
            
//             // royaltyToMatch = royaltyArray[1]/SALEPRICE;
//             // expect(ROYALTY).to.equal(royaltyToMatch*100);

//         });
//     });


// });
