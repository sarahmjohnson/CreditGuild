const { ethers } = require("hardhat");
const { expect } = require("chai");
require("chai").should();

describe("Governance", function () {
  let MEMBERSHIPFEE = ethers.utils.parseEther("1");
  let VOUCHAMOUNT = ethers.utils.parseEther("1");
  let creditGuildAddress;
  let nounsDAOExecutor;
  let quorumVotesBPS = 200;
  let proposalThresholdBPS = 1;
  let votingDelay = 1;
  let votingPeriod = 5_760;
  let proposalId;

    before(async function () {
        [ADMIN, VETOER, ALICE, JERRY, JACK, BILL, BONNIE] = await ethers.getSigners();

        const NounsDAOLogicV1 = await ethers.getContractFactory("NounsDAOLogicV1Mock");
        nounsDAOLogicV1 = await NounsDAOLogicV1.deploy();

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
        const creditGuild = await CreditGuild.deploy(
        MEMBERSHIPFEE,
        VOUCHAMOUNT,
        marketRegistry.address,
        uTokenAddress,
        underlyingAddress
        );
        creditGuildAddress = creditGuild.address;

        const NounsDAOExecutor = await ethers.getContractFactory("NounsDAOExecutorMock");
        nounsDAOExecutor = await NounsDAOExecutor.deploy(ADMIN.address, 430000);
        
        const NounsDAOProxy = await ethers.getContractFactory("NounsDAOProxy");
        await NounsDAOProxy.connect(ADMIN).deploy(
            nounsDAOExecutor.address,
            creditGuildAddress,
            VETOER.address,
            ADMIN.address,
            nounsDAOLogicV1.address,
            votingPeriod,
            votingDelay,
            proposalThresholdBPS,
            quorumVotesBPS
        );

    });



    describe("Initialize", function () {
        it("Should initialize the governance", async function () {

            const tx = await nounsDAOLogicV1.initialize(
            nounsDAOExecutor.address,
            creditGuildAddress,
            VETOER.address,
            votingPeriod,
            votingDelay,
            proposalThresholdBPS,
            quorumVotesBPS
            );

            const resp = await tx.wait();
            result = resp.events[resp.events.length - 1].args.newQuorumVotesBPS;

            expect(result).to.equal(quorumVotesBPS);

        });
    });


    describe("Propose", function () {
        it("Should propose a new proposal", async function () {

            const tx = await nounsDAOLogicV1.connect(BILL).propose(
            [ALICE.address, JERRY.address, BILL.address],
            [1, 2, 3],
            ['alice', 'jerry', 'bill'],
            [1, 2, 3],
            'this is a proposal to change the name of our guild',
            );

            const resp = await tx.wait();
            proposalId = resp.events[resp.events.length - 1].args.id
            result = resp.events[resp.events.length - 1].args.description;

            expect(result).to.equal('this is a proposal to change the name of our guild');
        });
    });

    describe("Queue", function () {
        it("Should queue a proposal of state succeeded", async function () {

            const tx = await nounsDAOLogicV1.queue(
                proposalId
            );

            const resp = await tx.wait();
            result = resp.events[resp.events.length - 1].args.id;
            expect(result).to.equal(1);
        });
    });

    describe("Execute", function () {
        it("Executes a queued proposal if eta has passed", async function () {

            const tx = await nounsDAOLogicV1.execute(
                proposalId
            );

            const resp = await tx.wait();
            result = resp.events[resp.events.length - 1].args.id;
            expect(result).to.equal(1);
        });
    });

    describe("Cancel", function () {
        it("Cancels a proposal only if sender is the proposer, or proposer delegates dropped below proposal threshold", async function () {

            const tx = await nounsDAOLogicV1.cancel(
                proposalId
            );

            const resp = await tx.wait();
            result = resp.events[resp.events.length - 1].args.id;
            expect(result).to.equal(1);
        });
    });

    describe("Veto", function () {
        it("Vetoes a proposal only if sender is the vetoer and the proposal has not been executed", async function () {

            const tx = await nounsDAOLogicV1.veto(
                proposalId
            );

            const resp = await tx.wait();
            result = resp.events[resp.events.length - 1].args.id;
            expect(result).to.equal(1);
        });
    });

    describe("Get Actions", function () {
        it("Gets actions of a proposal", async function () {

            const tx = await nounsDAOLogicV1.getActions(
                proposalId
            );
            
            expect(tx[0][0]).to.equal(ALICE.address);

        });
    });

    describe("Get Voter", function () {
        it("Gets actions of a proposal", async function () {

            const tx = await nounsDAOLogicV1.getActions(
                proposalId
            );
            
            expect(tx[0][0]).to.equal(ALICE.address);
            
        });
    });

    describe("Get Receipt", function () {
        it("Gets the receipt for a voter on a given proposal", async function () {

            const tx = await nounsDAOLogicV1.getReceipt(
                proposalId, ALICE.address
            );
            expect(tx[0]).to.equal(false);
            
        });
    });

    describe("State", function () {
        it("Gets the state of a proposal", async function () {

            const tx = await nounsDAOLogicV1.state(
                proposalId
            );
            expect(tx).to.equal(8);

        });
    });

    describe("Cast Vote", function () {
        it("Cast vote for a proposal", async function () {

            const tx = await nounsDAOLogicV1.castVote(
                proposalId, 1
            );
            const resp = await tx.wait();
            result = resp.events[resp.events.length - 1].args;
            expect(result[1]).to.equal(1);

        });
    });

    describe("Cast Vote with Reason", function () {
        it("Cast vote for a proposal with a reason", async function () {

            const tx = await nounsDAOLogicV1.castVoteWithReason(
                proposalId, 1, 'because i said so'
            );
            const resp = await tx.wait();
            result = resp.events[resp.events.length - 1].args;
            expect(result[1]).to.equal(1);

        });
    });

    describe("Cast Vote by Signature", function () {
        it("Cast a vote for a proposal by signature", async function () {

        });
    });

});
