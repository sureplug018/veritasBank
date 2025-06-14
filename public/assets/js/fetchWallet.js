const selectedWallet = document.getElementById('wallet');

if (selectedWallet) {
  selectedWallet.addEventListener('change', async (e) => {
    e.preventDefault();
    const walletAddress = document.getElementById('wallet-address');
    walletAddress.textContent = 'Fetching wallet address...';
    walletAddress.style.color = 'white';
    const walletName = selectedWallet.value;
    const res = await fetch(`/api/v1/wallets/get-address/${walletName}`);
    const data = await res.json();

    if (data.status === 'success' && data.data.wallet.address !== undefined) {
      walletAddress.textContent = data.data.wallet.address;
      walletAddress.style.color = 'white';
    } else {
      walletAddress.textContent = 'Wallet address not found!';
      walletAddress.style.color = 'red';
    }
  });
}

const inputAccountNumber = document.getElementById('accountNumber');
const gateway = document.getElementById('gateway');

if (inputAccountNumber) {
  inputAccountNumber.addEventListener('input', async (e) => {
    e.preventDefault();
    const beneficiary = document.getElementById('beneficiary');
    const accountNumber = inputAccountNumber.value;
    if (
      accountNumber.length === 10 &&
      gateway.value === 'Inter-Bank Transfer'
    ) {
      beneficiary.textContent = 'Fetching beneficiary...';
      beneficiary.style.color = 'white';
      const res = await fetch(
        `/api/v1/transactions/get-account/${accountNumber}`
      );
      // console.log(res)
      const data = await res.json();

      if (
        data.status === 'success' &&
        data.data.account.accountNumber !== undefined
      ) {
        beneficiary.textContent =
          data.data.account.firstName + ' ' + data.data.account.lastName;
        beneficiary.style.color = 'white';
      } else {
        beneficiary.textContent = 'Invalid account number';
        beneficiary.style.color = 'red';
      }
    }
  });
}
