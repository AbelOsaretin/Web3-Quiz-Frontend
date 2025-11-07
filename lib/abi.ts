export const abi =  [
    {
      "type": "constructor",
      "inputs": [
        {
          "name": "_rewardTokenAddress",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "_verifierAddress",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "_adminAddress",
          "type": "address",
          "internalType": "address"
        }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "ADMIN",
      "inputs": [],
      "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "REWARDTOKEN",
      "inputs": [],
      "outputs": [
        { "name": "", "type": "address", "internalType": "contract IERC20" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "VERIFIER_ADDRESS",
      "inputs": [],
      "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "claimReward",
      "inputs": [
        { "name": "_userId", "type": "string", "internalType": "string" },
        { "name": "_recipient", "type": "address", "internalType": "address" },
        { "name": "_amount", "type": "uint256", "internalType": "uint256" },
        { "name": "_rawClaimId", "type": "string", "internalType": "string" },
        { "name": "_signature", "type": "bytes", "internalType": "bytes" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "sendFunds",
      "inputs": [
        { "name": "_userId", "type": "string", "internalType": "string" },
        { "name": "_rawClaimId", "type": "string", "internalType": "string" },
        { "name": "_recipient", "type": "address", "internalType": "address" },
        { "name": "_amount", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "userClaimedRewards",
      "inputs": [{ "name": "", "type": "string", "internalType": "string" }],
      "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
      "stateMutability": "view"
    },
    {
      "type": "event",
      "name": "FundsSent",
      "inputs": [
        {
          "name": "recipient",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "amount",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        },
        {
          "name": "admin",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "RewardClaimed",
      "inputs": [
        {
          "name": "recipient",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "amount",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        },
        {
          "name": "userId",
          "type": "string",
          "indexed": true,
          "internalType": "string"
        },
        {
          "name": "claimId",
          "type": "string",
          "indexed": true,
          "internalType": "string"
        }
      ],
      "anonymous": false
    }
  ] as const