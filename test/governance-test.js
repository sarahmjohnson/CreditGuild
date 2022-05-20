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

        const NounsDAOLogicV1 = await ethers.getContractFactory("NounsDAOLogicV1");
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

        // TODO: figure out how to mock admin setting. right now its just commented out in NounsDAOLogicV1.sol
        const NounsDAOExecutor = await ethers.getContractFactory("NounsDAOExecutor");
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

            const tx = await nounsDAOLogicV1.connect(ADMIN).initialize(
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

            // TODO: figure out how to mock vote threshold. right now its just commented out in NounsDAOLogicV1.sol

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

                // TODO: mock proposal state to succeeded, call coming from admin - NounsDAOLogicV1 and NounsDAOExecutor
                const tx = await nounsDAOLogicV1.connect(ADMIN).queue(
                    proposalId
                );
    
                const resp = await tx.wait();
                result = resp.events[resp.events.length - 1].args.id;
                queueId = result
                // expect(result).to.equal('this is a proposal to change the name of our guild');
        });
    });

});
