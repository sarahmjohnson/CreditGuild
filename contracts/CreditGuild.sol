//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@unioncredit/v1-sdk/contracts/BaseUnionMember.sol";
import "@unioncredit/v1-sdk/contracts/interfaces/IUserManager.sol";

/*

*/

contract CreditGuild is ERC721 {

  uint256 public id;
  uint256 public newMemberFee = 20;
  address[] public initialMembers;
  IUserManager public userManager;

  // mapping of existing member to new member to endorsed
  mapping(address => mapping(address => bool)) public endorsements;

  // mapping of endorsed addresses
  mapping(address => bool) public endorsed;

  // Seed the DAO with 3 members
  constructor (
    address member1, 
    address member2, 
    address member3
    ) ERC721("UnionNFT", "UNFT") {

    //TODO: question - do the 3 initial members need to pay the membership fees?
    
    // make sure all addresses are unique
    require(member1 != member2, "All addresses must be unique");
    require(member2 != member3, "All addresses must be unique");
    require(member1 != member3, "All addresses must be unique");

    initialMembers = [member1, member2, member3];

    for (uint256 i = 0; i < 3; i++) {
    
      // check they are union members
      require(userManager.checkIsMember(initialMembers[i]), "Not a union member.");

      // set vouch_amount
      userManager.updateTrust(initialMembers[i], 0);

      // mint their NFT - which is their membership
      _mint(initialMembers[i], id++);

      // TODO: who is msg.sender in the constructor? is it the supdao contract address?
      // addresses endorse each other
      endorse(initialMembers[i]);

    }
  }

  function endorse(address newMember) public {

    require(userManager.checkIsMember(msg.sender), "Sender is not a union member.");
    require(endorsed[msg.sender], "Sender is not endorsed.");
    require(msg.sender != newMember, "New member cannot endorse herself.");

    // save the endorsement
    endorsements[msg.sender][newMember] = true;
    endorsed[msg.sender] = true;

    // the DAO vouches for this newMember - vouchAmount will be updated after the vote
    userManager.updateTrust(newMember, 0);
    
  }

  function register(address newMember) public {

    // check if msg.sender is endorsed
    require(endorsed[msg.sender], "Sender is not endorsed.");

    // check if newMember is endorsed
    require(endorsements[msg.sender][newMember]);
    
    // register newMember as a union member
    require(balanceOf(msg.sender) >= 1 ether);

    userManager.registerMember(newMember);

    // pay membership fee
    transferFrom(newMember, address(this), newMemberFee);

    // stake all the DAI
    stake();

    // mintNFT
    _mint(newMember, id);
    id++;

  }

  function setVouchAmount(address member, uint256 vouchAmount) private {

    // can only be updated after a vote by the DAO
    userManager.updateTrust(member, vouchAmount);

  }

  function stake() private {

    // get total DAI
    uint256 DAOBalance = balanceOf(address(this));

    // stake all the DAI
    userManager.stake(DAOBalance);

  }
}