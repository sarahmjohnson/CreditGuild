//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "../CreditGuild.sol";

/*
credit guild
*/
contract CreditGuildMock is CreditGuild { 

  // Seed the DAO with 3 members
  constructor (
    address member1, 
    address member2, 
    address member3,
    uint256 newMemberFee
    ) {
    
    // set membership fee
    membershipFee = newMemberFee;

    // make sure all addresses are unique
    require(member1 != member2, "All addresses must be unique");
    require(member2 != member3, "All addresses must be unique");
    require(member1 != member3, "All addresses must be unique");

    initialMembers = [member1, member2, member3];

    for (uint256 i = 0; i < 3; i++) {
    
      // check they are union members
    //   userManager.checkIsMember(initialMembers[i]);

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

  function register(address newMember) public override {
    require(membersArray.length == 3, "!3 members");

    // check account is vouched for by this member
    require(userManager.getVouchingAmount(newMember, msg.sender) > 0, "!vouching");

    // check address is member
    // require(members[newMember], "!member");

    // Mint the NFT (membership NFT)
    _mint(msg.sender, id++);

    // Guild vouches for this new member
    userManager.updateTrust(msg.sender, 0);
    
  }

  function setVouchAmount(address member, uint256 vouchAmount) public override{

    // can only be updated after a vote by the DAO
    userManager.updateTrust(member, vouchAmount);

    // get votes function in nouns dao

  }

  function stake() public override {

    // get total DAI
    uint256 DAOBalance = balanceOf(address(this));

    // stake all the DAI
    userManager.stake(DAOBalance);

  }
}