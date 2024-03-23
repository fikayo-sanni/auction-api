require('@nomiclabs/hardhat-waffle');

module.exports = {
  networks: {
    sepholia: {
      url: `https://sepholia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      accounts: [process.env.ACCOUNR_PRIVATE_KEY],
    },
  },
  solidity: '0.8.0',
};
