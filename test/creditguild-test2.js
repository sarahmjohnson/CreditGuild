// const {ethers, upgrades, waffle} = require("hardhat");

// const {expect} = require("chai");
// require("chai").should();
// const {signDaiPermit, signERC2612Permit} = require("eth-permit");
// const {parseEther} = require("ethers").utils;
// const {waitNBlocks} = require("../../utils");

// const AddressZero = ethers.constants.AddressZero;

// describe("User Manager Contract", () => {
//     before(async function () {
//         [ADMIN, ALICE, BOB, TOM, MEMBER1, MEMBER2, MEMBER3, MEMBER4, APP, PROXY_ADMIN] = await ethers.getSigners();

//         const AssetManager = await ethers.getContractFactory("AssetManagerMock");
//         const Comptroller = await ethers.getContractFactory("ComptrollerMock");
//         const ERC20 = await ethers.getContractFactory("FaucetERC20");

//         SumOfTrust = await ethers.getContractFactory("SumOfTrust");
//         const UnionToken = await ethers.getContractFactory("UnionTokenMock");
//         UserManager = await ethers.getContractFactory("UserManager");
//         UToken = await ethers.getContractFactory("UTokenMock");

//         assetManager = await upgrades.deployProxy(AssetManager, [], {
//             initializer: "__AssetManager_init()"
//         });
//         //name must be Dai Stablecoin, otherwise call signDaiPermit will error
//         erc20 = await upgrades.deployProxy(ERC20, ["Dai Stablecoin", "DAI"], {
//             initializer: "__FaucetERC20_init(string,string)"
//         });
//         unionToken = await UnionToken.deploy("Union Token", "unionToken");
//         creditLimitModel = await SumOfTrust.deploy(3);
//         comptroller = await Comptroller.deploy();
//         comptroller = await upgrades.deployProxy(Comptroller, [], {
//             initializer: "__ComptrollerMock_init()"
//         });
//         //mock transfer reward
//         await comptroller.setRewardsInfo(unionToken.address, 0);
//         uToken = await upgrades.deployProxy(UToken, [], {
//             initializer: "__UToken_init()"
//         });

//         const amount = parseEther("1000000");
//         // await erc20.mint(assetManager.address, amount);
//         // await erc20.mint(ADMIN.address, amount);
//         await erc20.mint(MEMBER1.address, amount);
//         await erc20.mint(MEMBER2.address, amount);
//         await erc20.mint(MEMBER3.address, amount);
//         await erc20.mint(MEMBER4.address, amount);
//     });

//     beforeEach(async () => {
//         userManager = await upgrades.deployProxy(
//             UserManager,
//             [
//                 assetManager.address,
//                 unionToken.address,
//                 erc20.address,
//                 creditLimitModel.address,
//                 comptroller.address,
//                 ADMIN.address
//             ],
//             {
//                 initializer: "__UserManager_init(address,address,address,address,address,address)"
//             }
//         );

//         await userManager.setUToken(uToken.address);
//         await userManager.addMember(MEMBER1.address);
//         await userManager.addMember(MEMBER2.address);
//         await userManager.addMember(MEMBER3.address);
//         await userManager.addMember(MEMBER4.address);
//     });
//     describe("Endorse", function () {

//         it("Existing DAO member should endorse a new member", async function () {

//             const tx = await hardhatSup_Dao.endorse(
//                 ROYALTY
//             )
//             const resp = await tx.wait();

//             console.log(resp);

//             // tokenId = resp.events[resp.events.length - 1].args.tokenId;

//             // expect(await tokenId).to.equal(1);

//             // royaltyAddress, royaltyArray = await hardhatNFT.royaltyInfo(tokenId, SALEPRICE);
//             // expect(this.address).to.equal(royaltyAddress);
            
//             // royaltyToMatch = royaltyArray[1]/SALEPRICE;
//             // expect(ROYALTY).to.equal(royaltyToMatch*100);

//         });
//     });


// });