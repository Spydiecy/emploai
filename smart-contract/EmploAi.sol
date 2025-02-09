// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract EmploAI is Ownable, ReentrancyGuard {
    // Structs
    struct Agent {
        uint256 id;
        string name;
        string description;
        uint256 pricePerMonth; // In FLOW (wei)
        string[] integrations;
        string[] features;
        bool isActive;
    }

    struct Subscription {
        uint256 agentId;
        uint256 startDate;
        uint256 endDate;
        bool isActive;
    }

    struct FeatureRequest {
        uint256 id;
        string title;
        string description;
        uint256 priceOffered; // In FLOW (wei)
        address requester;
        uint256 upvotes;
        string status; // "pending", "in-progress", "planned", "completed"
    }

    // State Variables
    uint256 private nextAgentId = 1;
    uint256 private nextRequestId = 1;
    uint256 public totalRevenue;

    mapping(uint256 => Agent) public agents;
    mapping(address => mapping(uint256 => Subscription)) public subscriptions;
    mapping(uint256 => FeatureRequest) public featureRequests;
    mapping(address => mapping(uint256 => bool)) public userUpvotes;

    // Events
    event AgentCreated(uint256 indexed id, string name, uint256 pricePerMonth);
    event SubscriptionPurchased(uint256 indexed agentId, address indexed subscriber, uint256 startDate, uint256 endDate);
    event FeatureRequested(uint256 indexed id, string title, uint256 priceOffered, address requester);
    event FeatureUpvoted(uint256 indexed requestId, address indexed upvoter);
    event SubscriptionExpired(uint256 indexed agentId, address indexed subscriber);
    event PaymentReceived(address indexed from, uint256 amount);
    event PaymentWithdrawn(address indexed to, uint256 amount);

    //constrcutor
    constructor(address initialOwner) Ownable(initialOwner) {
        // Initialize contract with the initial owner
    }

    // Modifiers
    modifier agentExists(uint256 agentId) {
        require(agents[agentId].isActive, "Agent does not exist or is inactive");
        _;
    }

    modifier validSubscription(uint256 agentId) {
        require(
            hasActiveSubscription(msg.sender, agentId),
            "No active subscription"
        );
        _;
    }

    // Admin Functions
    function createAgent(
        string memory name,
        string memory description,
        uint256 pricePerMonth,
        string[] memory integrations,
        string[] memory features
    ) external onlyOwner {
        Agent memory newAgent = Agent({
            id: nextAgentId,
            name: name,
            description: description,
            pricePerMonth: pricePerMonth,
            integrations: integrations,
            features: features,
            isActive: true
        });

        agents[nextAgentId] = newAgent;
        emit AgentCreated(nextAgentId, name, pricePerMonth);
        nextAgentId++;
    }

    function deactivateAgent(uint256 agentId) external onlyOwner {
        require(agents[agentId].isActive, "Agent already inactive");
        agents[agentId].isActive = false;
    }

    function updateFeatureRequestStatus(uint256 requestId, string memory newStatus) external onlyOwner {
        require(bytes(featureRequests[requestId].title).length > 0, "Request does not exist");
        featureRequests[requestId].status = newStatus;
    }

    // Subscription Functions
    function purchaseSubscription(uint256 agentId) external payable nonReentrant agentExists(agentId) {
        Agent memory agent = agents[agentId];
        require(msg.value == agent.pricePerMonth, "Incorrect payment amount");

        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + 30 days;

        subscriptions[msg.sender][agentId] = Subscription({
            agentId: agentId,
            startDate: startTime,
            endDate: endTime,
            isActive: true
        });

        totalRevenue += msg.value;
        emit SubscriptionPurchased(agentId, msg.sender, startTime, endTime);
        emit PaymentReceived(msg.sender, msg.value);
    }

    function hasActiveSubscription(address user, uint256 agentId) public view returns (bool) {
        Subscription memory sub = subscriptions[user][agentId];
        return sub.isActive && sub.endDate > block.timestamp;
    }

    function checkAndUpdateSubscription(address user, uint256 agentId) public {
        Subscription storage sub = subscriptions[user][agentId];
        if (sub.isActive && sub.endDate <= block.timestamp) {
            sub.isActive = false;
            emit SubscriptionExpired(agentId, user);
        }
    }

    // Feature Request Functions
    function submitFeatureRequest(
        string memory title,
        string memory description,
        uint256 priceOffered
    ) external {
        FeatureRequest memory request = FeatureRequest({
            id: nextRequestId,
            title: title,
            description: description,
            priceOffered: priceOffered,
            requester: msg.sender,
            upvotes: 0,
            status: "pending"
        });

        featureRequests[nextRequestId] = request;
        emit FeatureRequested(nextRequestId, title, priceOffered, msg.sender);
        nextRequestId++;
    }

    function upvoteFeatureRequest(uint256 requestId) external {
        require(bytes(featureRequests[requestId].title).length > 0, "Request does not exist");
        require(!userUpvotes[msg.sender][requestId], "Already upvoted");

        featureRequests[requestId].upvotes++;
        userUpvotes[msg.sender][requestId] = true;
        emit FeatureUpvoted(requestId, msg.sender);
    }

    // View Functions
    function getAgent(uint256 agentId) external view returns (
        string memory name,
        string memory description,
        uint256 pricePerMonth,
        string[] memory integrations,
        string[] memory features,
        bool isActive
    ) {
        Agent memory agent = agents[agentId];
        return (
            agent.name,
            agent.description,
            agent.pricePerMonth,
            agent.integrations,
            agent.features,
            agent.isActive
        );
    }

    function getSubscriptionDetails(address user, uint256 agentId) external view returns (
        uint256 startDate,
        uint256 endDate,
        bool isActive
    ) {
        Subscription memory sub = subscriptions[user][agentId];
        return (sub.startDate, sub.endDate, sub.isActive);
    }

    function getFeatureRequest(uint256 requestId) external view returns (
        string memory title,
        string memory description,
        uint256 priceOffered,
        address requester,
        uint256 upvotes,
        string memory status
    ) {
        FeatureRequest memory request = featureRequests[requestId];
        return (
            request.title,
            request.description,
            request.priceOffered,
            request.requester,
            request.upvotes,
            request.status
        );
    }

    function getContractBalance() external view onlyOwner returns (uint256) {
        return address(this).balance;
    }

    // Withdrawal Function
    function withdrawFunds(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Insufficient balance");
        (bool sent, ) = owner().call{value: amount}("");
        require(sent, "Failed to send FLOW");
        emit PaymentWithdrawn(owner(), amount);
    }

    // Function to receive FLOW
    receive() external payable {
        emit PaymentReceived(msg.sender, msg.value);
    }
}