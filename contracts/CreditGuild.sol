//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@unioncredit/v1-sdk/contracts/BaseUnionMember.sol";

/*
credit guild
*/

// contract CreditGuild is ERC721, BaseUnionMember { 
// TODO: ask gerald about making nft non transferrable
contract CreditGuild is ERC721, BaseUnionMember, Ownable { 

    bool public isInitialized;

    // IERC20 public underlyingToken;

    uint256 public constant MIN_MEMBERSHIP_FEE = 1 ether;

    uint256 public id;

    uint256 public membershipFee;
    
    uint256 public vouchAmount;

    mapping(address => uint256) public addressToId;


    event Initialize(address[] initialMembers);
    event SetVouchAmount(uint256 vouchAmount);
    event Register(address sender, address[] members, uint256 vouchAmount);
    event SetMembershipFee(uint256 membershipFee);
    event ClaimVouch(address sender, uint256 vouchAmount);
    event MintNFT(address member, uint256 currentId);
    event BurnMembership(address member, uint256 memberId);


    constructor(
      uint256 _membershipFee,
      uint256 _vouchAmout,
      address _marketRegistry,
      address _unionToken,
      address _underlyingToken
    ) ERC721("UnionNFT", "UNFT") BaseUnionMember(_marketRegistry, _unionToken, _underlyingToken) {
        console.log('hi');
        
        // set membership fee
        require(_membershipFee >= MIN_MEMBERSHIP_FEE, "membershipFee too low");
        membershipFee = _membershipFee;
        vouchAmount = _vouchAmout;
        // TODO: i don't think we need to declare this because its a state variable
        // underlyingToken = IERC20(_underlyingToken);
        isInitialized = false;
    }

    // Seed the DAO with 3 members
    function initialize(
        address member1, 
        address member2, 
        address member3
    ) public onlyOwner {
        require(!isInitialized, 'initialized');
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
            require(userManager.getVouchingAmount(member, address(this)) > 0, "!vouching");

            // pay membership fee
            underlyingToken.transferFrom(member, address(this), membershipFee);

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

    // TODO: this wont work right now because of the beforeTokenTransfer override
    function burnMembership(address member) public virtual onlyOwner {
        uint256 memberId = addressToId[member];
        _burn(memberId);
        emit BurnMembership(member, memberId);

    }

    function checkIsMember(address potentialMember) public virtual returns(bool) {
      return balanceOf(potentialMember) > 0;
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
        uint256 DAOBalance = balanceOf(address(this));
        // stake all the DAI
        userManager.stake(DAOBalance);
    }

    function mintNFT(address member) internal {
        // mint their NFT - which is their membership
        uint256 currentId = ++id;
        _safeMint(member, currentId);
        addressToId[member] = currentId;
        emit MintNFT(member, currentId);
    }

    // calls before every ERC721 call
    function _beforeTokenTransfer(
        address from,
        address,
        uint256  
    ) internal override pure {
      if(from != address(0)) {
        // cannot transfer
        require(false, "!transfer");
      }
    }
}