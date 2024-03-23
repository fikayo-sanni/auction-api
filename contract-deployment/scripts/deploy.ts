import { ethers } from 'hardhat';
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with the account:', deployer.address);

  const Contract = await ethers.getContractFactory('SimpleAuction');
  const contract = await Contract.deploy();

  console.log('Contract address:', contract);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
