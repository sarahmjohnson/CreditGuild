//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

contract MarketRegistryMock { 
    struct Market { 
        address uToken; 
        address userManager; 
    } 
    
    address[] public uTokenList; 
    address[] public userManagerList; 
    
    mapping(address => Market) public tokens; 
    
    function addUToken(address token, address uToken) public {
        uTokenList.push(uToken); 
        tokens[token].uToken = uToken; 
    } 
    
    function addUserManager(address token, address userManager) public {
        userManagerList.push(userManager); 
        tokens[token].userManager = userManager; 
    }
}