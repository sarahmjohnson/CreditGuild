//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "./base/ERC721Checkpointable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@unioncredit/v1-sdk/contracts/BaseUnionMember.sol";

/*
credit guild
*/

// TODO: ask gerald about making nft non transferrable
contract CreditGuild is ERC721Checkpointable, BaseUnionMember, Ownable { 

    bool public isInitialized;

    uint256 public constant MIN_MEMBERSHIP_FEE = 1 ether;

    uint256 public id;

    uint256 public membershipFee;
    
    uint256 public vouchAmount;

    event Initialize(address[] initialMembers);
    event SetVouchAmount(uint256 vouchAmount);
    event Register(address sender, address[] members, uint256 vouchAmount);
    event SetMembershipFee(uint256 membershipFee);
    event ClaimVouch(address sender, uint256 vouchAmount);
    event MintNFT(address member, uint256 currentId);
    event BurnMembership(address member, uint256 memberId);
    event CheckIsMember(bool result);
    event Stake(uint256 daoBalance);

    constructor(
      uint256 _membershipFee,
      uint256 _vouchAmout,
      address _marketRegistry,
      address _unionToken,
      address _underlyingToken
    ) ERC721("UnionNFT", "UNFT") BaseUnionMember(_marketRegistry, _unionToken, _underlyingToken) {
        
        // set membership fee
        require(_membershipFee >= MIN_MEMBERSHIP_FEE, "membershipFee too low");
        membershipFee = _membershipFee;
        vouchAmount = _vouchAmout;
        isInitialized = false;
        
    }
    // nouns dao v1 logic, nouns dao immutable, ercenumerable

    // Seed the DAO with 3 members
    function initialize(
        address member1, 
        address member2, 
        address member3
    ) public onlyOwner {
        
        require(!isInitialized, "initialized");
        isInitialized = true;

        // make sure all addresses are unique
        require(member1 != member2, "!unique");
        require(member2 != member3, "!unique");
        require(member1 != member3, "!unique");

        address[] memory initialMembers = new address[](3);
        initialMembers[0] = member1;
        initialMembers[1] = member2;
        initialMembers[2] = member3;

        require(userManager.checkIsMember(address(this)), "DAO !member");

        for (uint256 i = 0; i < 3; i++) {
            address member = initialMembers[i];

            // check that this member is vouching for the DAO
            // TODO: shouldn't this be: getVouchingAmount(address(this), member) ?
            require(userManager.getVouchingAmount(member, address(this)) > 0, "!vouching");

            // set vouch_amount
            userManager.updateTrust(member, vouchAmount);

            // mint NFT which is their membership
            mintNFT(member);
        } 

        // call stake on behalf of the dao, call register member on behalf of the dao

        emit Initialize(initialMembers);

    }

    function setVouchAmount(uint256 _vouchAmount) public virtual onlyOwner {

        vouchAmount = _vouchAmount;
        emit SetVouchAmount(vouchAmount);

    }

    function setMembershipFee(uint256 _membershipFee) public virtual onlyOwner {

        membershipFee = _membershipFee;
        emit SetMembershipFee(membershipFee);

    }

    function burnMembership(address member) public virtual onlyOwner {
        require(checkIsMember(member), "!member");
        uint256 membershipId = tokenOfOwnerByIndex(member, 0); 
        require(ownerOf(membershipId) == member, "!member");
        _burn(membershipId); 
        emit BurnMembership(member, membershipId); 
        
    }

    function checkIsMember(address potentialMember) public virtual returns(bool) {

        bool result = balanceOf(potentialMember) > 0;
        emit CheckIsMember(result);
        return(result);

    }

    function register(address[] memory members) public virtual {

        require(members.length == 3, "!3 members");
        require(!checkIsMember(msg.sender), "member");

        for (uint256 i = 0; i < members.length; i++) {
          require(checkIsMember(members[i]), "!member");
          require(userManager.getVouchingAmount(members[i], msg.sender) > 0, "!vouching");
        }

        // Mint the NFT (membership NFT)
        mintNFT(msg.sender);

        // DAO vouches for this new member
        userManager.updateTrust(msg.sender, vouchAmount);

        emit Register(msg.sender, members, vouchAmount);
    }

    // members can call this function to updateTrust on themselves, for example
    function claimVouch() public {

        userManager.updateTrust(msg.sender, vouchAmount);
        emit ClaimVouch(msg.sender, vouchAmount);

    }

    function stake() public virtual {

        // get total DAI
        uint256 daoBalance = balanceOf(address(this));

        // stake all the DAI
        userManager.stake(daoBalance);

        emit Stake(daoBalance);
    }

    function mintNFT(address member) internal {

        // mint their NFT - which is their membership
        uint256 currentId = ++id;
        _safeMint(address(this), member, currentId);

        emit MintNFT(member, currentId);

    }

}