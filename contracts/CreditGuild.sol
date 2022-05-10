//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@unioncredit/v1-sdk/contracts/BaseUnionMember.sol";

/*
credit guild
*/
contract CreditGuild is ERC721, BaseUnionMember { 
// contract CreditGuild is ERC721, BaseUnionMember { // replace with the nouns one. copy it over and change stuff.

  uint256 public id;
  uint256 public membershipFee;
  address[] public initialMembers;
  ERC20 public erc20;
  // IUserManager public userManager;
  // ask gerald about making nft non transferrable

  // mapping of existing member to new member to endorsed
  mapping(address => mapping(address => bool)) public endorsements;

  mapping(address => bool) public members;
  address[] public membersArray;


  // mapping of endorsed addresses
  mapping(address => bool) public endorsed;

  // Seed the DAO with 3 members
  constructor (
    address member1, 
    address member2, 
    address member3,
    uint256 newMemberFee
    ) ERC721("UnionNFT", "UNFT") {
    
    // set membership fee
    membershipFee = newMemberFee;

    // make sure all addresses are unique
    require(member1 != member2, "All addresses must be unique");
    require(member2 != member3, "All addresses must be unique");
    require(member1 != member3, "All addresses must be unique");

    initialMembers = [member1, member2, member3];

    for (uint256 i = 0; i < 3; i++) {
    
      // check they are union members
      userManager.checkIsMember(initialMembers[i]);

      // pay membership fee
      erc20.transferFrom(initialMembers[i], address(this), membershipFee);

      // set vouch_amount
      userManager.updateTrust(initialMembers[i], 0);

      // mint their NFT - which is their membership
      _mint(initialMembers[i], id++);

      // add to membersArray
      membersArray.push(initialMembers[i]);

    }
  }

  function register(address newMember) public virtual {
    require(membersArray.length == 3, "!3 members");

    // check account is vouched for by this member
    require(userManager.getVouchingAmount(newMember, msg.sender) > 0, "!vouching");

    // check address is member
    require(members[newMember], "!member");

    // Mint the NFT (membership NFT)
    _mint(msg.sender, id++);

    // Guild vouches for this new member
    userManager.updateTrust(msg.sender, 0);
    
  }

  function setVouchAmount(address member, uint256 vouchAmount) public virtual {

    // can only be updated after a vote by the DAO
    userManager.updateTrust(member, vouchAmount);

    // get votes function in nouns dao

  }

  function stake() public virtual {

    // get total DAI
    uint256 DAOBalance = balanceOf(address(this));

    // stake all the DAI
    userManager.stake(DAOBalance);

  }
}