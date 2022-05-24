const { ethers } = require("hardhat");
const { expect } = require("chai");
require("chai").should();

describe("CreditGuild", function () {
  let MEMBERSHIPFEE = ethers.utils.parseEther("1");
  let VOUCHAMOUNT = ethers.utils.parseEther("1");

  before(async function () {
    [ADMIN, ALICE, BOB, TOM, JACK, MEMBER1, MEMBER2, MEMBER3] =
      await ethers.getSigners();

    const MarketRegistry = await ethers.getContractFactory(
      "MarketRegistryMock"
    );
    const marketRegistry = await MarketRegistry.deploy();
    const MockERC20 = await ethers.getContractFactory("FaucetERC20");

    // deploy underlyingToken
    const underlyingToken = await MockERC20.deploy();
    await underlyingToken.mint(ADMIN.address, ethers.utils.parseEther("100")); // min 100 DAI (underlying)
    const underlyingAddress = underlyingToken.address;

    // deploy uToken
    const uToken = await MockERC20.deploy();
    await uToken.mint(ADMIN.address, ethers.utils.parseEther("100"));
    const uTokenAddress = uToken.address;
    
    // fund members' accounts
    await underlyingToken.mint(MEMBER1.address, ethers.utils.parseEther("100")); // min 100 DAI (underlying)
    await underlyingToken.mint(MEMBER2.address, ethers.utils.parseEther("100")); // min 100 DAI (underlying)
    await underlyingToken.mint(MEMBER3.address, ethers.utils.parseEther("100")); // min 100 DAI (underlying)

    // deploy userManager
    const UserManager = await ethers.getContractFactory("UserManagerMock");
    const userManager = await UserManager.deploy();
    await userManager.setIsMember(true);
    // await userManager.getVouchingAmount();

    // add mockUtoken contract for the mock underlying token (DAI)
    await marketRegistry.addUToken(underlyingAddress, uTokenAddress);
    await marketRegistry.addUserManager(underlyingAddress, userManager.address);

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

      const tx = await creditGuild.initialize(
        MEMBER1.address,
        MEMBER2.address,
        MEMBER3.address
      );

      const resp = await tx.wait();
      result = resp.events[resp.events.length - 1].args.initialMembers;

      array2 = [MEMBER1.address, MEMBER2.address, MEMBER3.address]

      expect(result[0]).to.equal(array2[0]);
      expect(result[1]).to.equal(array2[1]);
      expect(result[2]).to.equal(array2[2]);

    });
  });

  describe("SetMembershipFee", function () {
    it("Should set membership fee", async function () {

      // membershipFee should be set to the amount provided in the constructor
      const initialMembershipFee = await creditGuild.membershipFee();
      expect(MEMBERSHIPFEE).to.equal(initialMembershipFee);

      // happy path - test changing the fee with the setMembershipFee function
      const newMembershipFee = ethers.utils.parseEther("200");
      await creditGuild.setMembershipFee(newMembershipFee);
      const membershipFee = await creditGuild.membershipFee();
      expect(membershipFee).to.equal(newMembershipFee);

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

    });
  });

  describe("CheckIsMember", function () {
    it("Should check if address is a member", async function () {

      // MEMBER1 should be a member
      const potentialMember = MEMBER1.address;
      const tx = await creditGuild.checkIsMember(potentialMember);
      const resp = await tx.wait();
      result = resp.events[resp.events.length - 1].args.result;
      expect(result).to.equal(true);

      // JACK should not be a member
      const potentialMember2 = JACK.address;
      const tx2 = await creditGuild.checkIsMember(potentialMember2);
      const resp2 = await tx2.wait();
      result2 = resp2.events[resp2.events.length - 1].args.result;
      expect(result2).to.equal(false);

    });
  });

  describe("Register", function () {
    it("Should register an array of members", async function () {

      // unhappy path - should revert because ALICE is not a member
      await expect(creditGuild.register(
        [MEMBER1.address, MEMBER2.address, ALICE.address]
      )).to.be.revertedWith('!member');

      // unhappy path - all 3 of the members are not vouching for msg.sender
      // TODO: with the mock set as always vouching 1, we are unable to test this

      // happy path
      const addressToRegister = ALICE.address;

      const tx = await creditGuild.checkIsMember(addressToRegister);
      const resp = await tx.wait();
      result = resp.events[resp.events.length - 1].args.result;
      expect(result).to.equal(false);

      await creditGuild.connect(ALICE).register([MEMBER1.address, MEMBER2.address, MEMBER3.address]);

      const tx1 = await creditGuild.checkIsMember(addressToRegister);
      const resp1 = await tx1.wait();
      result1 = resp1.events[resp1.events.length - 1].args.result;
      expect(result1).to.equal(true);

      // unhappy path - should revert because msg.sender is already a member
      await expect(creditGuild.connect(ALICE).register(
        [MEMBER1.address, MEMBER2.address, MEMBER3.address]
      )).to.be.revertedWith('member');;

    });
  });

  describe("Claim Vouch", function () {
    it("Should allow an address to claim a vouch", async function () {

      // get current vouch amount
      vouchAmount = await creditGuild.vouchAmount();

      tx = await creditGuild.claimVouch();
      const resp = await tx.wait();
      result = resp.events[resp.events.length - 1].args.vouchAmount;
      expect(result).to.equal(vouchAmount);

    });
  });

  describe("Burn Membership", function () {
    it("Should burn a membership to the DAO", async function () {

      // happy path
      tx = await creditGuild.checkIsMember(MEMBER1.address);
      const resp = await tx.wait();
      result = resp.events[resp.events.length - 1].args.result;
      expect(result).to.equal(true);

      tx2 = await creditGuild.burnMembership(MEMBER1.address);
      const resp2 = await tx2.wait();
      result2 = resp2.events[resp2.events.length - 1].args.member;
      expect(result2).to.equal(MEMBER1.address);

      tx3 = await creditGuild.checkIsMember(MEMBER1.address);
      const resp3 = await tx3.wait();
      result3 = resp3.events[resp3.events.length - 1].args.result;
      expect(result3).to.equal(false);

      // unhappy path
      tx4 = await creditGuild.checkIsMember(JACK.address);
      const resp4 = await tx4.wait();
      result4 = resp4.events[resp4.events.length - 1].args.result;
      expect(result4).to.equal(false);

      await expect(creditGuild.burnMembership(JACK.address)).to.be.revertedWith('!member');

    });
  });
});
