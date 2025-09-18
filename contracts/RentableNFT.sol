// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title IERC4907
 * @dev Interface for rentable NFTs (ERC-4907)
 */
interface IERC4907 {
    event UpdateUser(uint256 indexed tokenId, address indexed user, uint64 expires);

    function setUser(uint256 tokenId, address user, uint64 expires) external;
    function userOf(uint256 tokenId) external view returns (address);
    function userExpires(uint256 tokenId) external view returns (uint64);
}

/**
 * @title RentableNFT
 * @dev Implementation of ERC-4907 rentable NFT standard with minting capabilities
 */
contract RentableNFT is ERC721, ERC721URIStorage, Ownable, Pausable, IERC4907 {
    struct UserInfo {
        address user;
        uint64 expires;
    }

    uint256 private _nextTokenId = 1;
    mapping(uint256 => UserInfo) private _users;

    // Marketplace contract address that can manage rentals
    address public marketplaceContract;

    modifier onlyOwnerOrMarketplace(uint256 tokenId) {
        require(
            ownerOf(tokenId) == msg.sender || msg.sender == marketplaceContract,
            "Not authorized"
        );
        _;
    }

    constructor(address initialOwner) ERC721("MetaLease NFT", "MLNFT") Ownable(initialOwner) {
        require(initialOwner != address(0), "Owner cannot be zero address");
        // _nextTokenId is already initialized to 1
    }

    /**
     * @dev Set the marketplace contract address
     */
    function setMarketplaceContract(address _marketplace) external onlyOwner {
        require(_marketplace != address(0), "Marketplace cannot be zero address");
        marketplaceContract = _marketplace;
    }

    /**
     * @dev Pause the contract (emergency only)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Mint a new NFT
     */
    function mint(address to, string memory uri) external whenNotPaused returns (uint256) {
        require(to != address(0), "Cannot mint to zero address");
        require(bytes(uri).length > 0, "URI cannot be empty");
        
        uint256 tokenId = _nextTokenId++;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        return tokenId;
    }

    /**
     * @dev Set the user and expires of an NFT
     */
    function setUser(uint256 tokenId, address user, uint64 expires) external virtual override whenNotPaused onlyOwnerOrMarketplace(tokenId) {
        UserInfo storage info = _users[tokenId];
        info.user = user;
        info.expires = expires;
        emit UpdateUser(tokenId, user, expires);
    }

    /**
     * @dev Get the user address of an NFT
     */
    function userOf(uint256 tokenId) external view virtual override returns (address) {
        if (uint64(block.timestamp) >= _users[tokenId].expires) {
            return address(0);
        }
        return _users[tokenId].user;
    }

    /**
     * @dev Get the user expires of an NFT
     */
    function userExpires(uint256 tokenId) external view virtual override returns (uint64) {
        return _users[tokenId].expires;
    }

    /**
     * @dev Check if NFT is currently rented
     */
    function isRented(uint256 tokenId) external view returns (bool) {
        return uint64(block.timestamp) < _users[tokenId].expires && _users[tokenId].user != address(0);
    }

    /**
     * @dev Get current renter of an NFT
     */
    function getCurrentRenter(uint256 tokenId) external view returns (address) {
        if (uint64(block.timestamp) >= _users[tokenId].expires) {
            return address(0);
        }
        return _users[tokenId].user;
    }

    /**
     * @dev Override supportsInterface to include ERC4907
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, ERC721URIStorage) returns (bool) {
        return interfaceId == type(IERC4907).interfaceId || super.supportsInterface(interfaceId);
    }

    /**
     * @dev Override tokenURI to handle URI storage
     */
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    /**
     * @dev Get total supply of minted NFTs
     */
    function totalSupply() external view returns (uint256) {
        return _nextTokenId - 1;
    }

    /**
     * @dev Get all tokens owned by an address
     */
    function tokensOfOwner(address owner) external view returns (uint256[] memory) {
        uint256 tokenCount = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](tokenCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 1; i < _nextTokenId; i++) {
            if (_ownerOf(i) == owner) {
                tokenIds[currentIndex] = i;
                currentIndex++;
            }
        }
        
        return tokenIds;
    }

    // Required overrides
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        
        // Clear user info when token is transferred
        if (from != to && from != address(0)) {
            delete _users[tokenId];
            emit UpdateUser(tokenId, address(0), 0);
        }
        
        return super._update(to, tokenId, auth);
    }
}