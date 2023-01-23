// DOM ELEMENTS
(() => {
  const authForm = document.querySelector(".auth-form");
  const logOutBtn = document.querySelector(".nav__el--logout");
  const userDataForm = document.querySelector(".form-user-data");
  const userPasswordForm = document.querySelector(".form-user-password");
  const subscriptionPlansCont = document.querySelector(".subscription-plans-container");
  const forgotPasswordForm = document.querySelector('.forgot-password-form');
  const myAppsContainer = document.querySelector('.my-apps');

  if (AOS) {
    AOS.init();
  }
  
  if (authForm) {
    authForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirmPassword")?.value;
      const username = document.getElementById("username")?.value;

      if (confirmPassword && username) {
        if (password !== confirmPassword) {
          showInfoPopup({
            status: "fail",
            message: "Password and confirmPassword are not same.",
          });
          return;
        }

        authenticateForm({ username, email, password }, "signup");
        return;
      }
      authenticateForm({ email, password }, "login");
    });
  }

  if (logOutBtn) logOutBtn.addEventListener("click", logout);

  if (userDataForm)
    userDataForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const username = document.querySelector(".form-user-data #username").value
      const email = document.querySelector(".form-user-data #email").value

      updateSettings({username, email}, "updateMe");
    });

  if (userPasswordForm)
    userPasswordForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      document.querySelector(".btn--save-password").textContent = "Updating...";

      let passwordCurrent = document.getElementById("password-current").value;
      let password = document.getElementById("password").value;
      let passwordConfirm = document.getElementById("password-confirm").value;

      if (password !== passwordConfirm) {
        document.querySelector(".btn--save-password").textContent = "Save password";
        showInfoPopup({
          status: "fail",
          message: "Password and confirmPassword are not same.",
        });
        return;
      }

      await updateSettings(
        { passwordCurrent, password, passwordConfirm },
        "updateMyPassword"
      );

      document.querySelector(".btn--save-password").textContent = "Save password";
      document.getElementById("password-current").value = "";
      document.getElementById("password").value = "";
      document.getElementById("password-confirm").value = "";
    });

  async function authenticateForm(body, type) {
    /* type - login, signup */
    try {
      const res = await fetch(`/api/v1/users/${type}`, {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data?.status === "success") {
        showInfoPopup(data);
        navigateTo("/");
        return;
      }

      throw data;
    } catch (err) {
      showInfoPopup(err);
    }
  }

  async function logout() {
    try {
      const res = await fetch("/api/v1/users/logout");
      const data = await res.json();

      if (data?.status === "success") {
        showInfoPopup(data);
        navigateTo("/");
        return;
      }

      throw data;
    } catch (err) {
      showInfoPopup(err);
    }
  }

  async function updateSettings(body, type) {
    /* type - updateMyPassword, updateMe */
    try {
      const res = await fetch(`/api/v1/users/${type}`, {
        method: "PATCH",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data?.status === "success") {
        showInfoPopup(data);
        return;
      }

      throw data;
    } catch (err) {
      showInfoPopup(err);
    }
  }

if (myAppsContainer) {
  const btn = myAppsContainer.querySelector('.add-new-account');

  btn.addEventListener('click', showAddAccountModal)

  function showAddAccountModal() {
    const modal = document.createElement("div");
    const overlay = document.createElement('div');
    modal.className = `modal-add-account flex`;
    overlay.className = 'modal-overlay flex center';
  
    modal.insertAdjacentHTML('beforeend', `
      <h2 class="heading-secondary ma-bt-md ma-tp-md"> Add account </h2>
      <form class="form form-add-account flex">
        <div class="form__group add-account-select">
          <label class="form__label" for="account-type"> Account Type: </label>
          <select class="border-blue" id="account-type" default="0" name="account-type">
            <option value="0"> Facebook </option>
            <option value="1"> Google </option>
            <option value="2"> Instagram </option>
          </select>
        </div>
        <div class="form__group">
          <label class="form__label" for="account-login"> Login: </label>
          <input class="form__input" id="account-login" name="account-login" required/>
        </div>
        <div class="form__group">
          <label class="form__label" for="account-password"> Password: </label>
          <input type="password" class="form__input" id="account-password" name="account-password" required />
        </div>
        <div class="form__group">
          <label class="form__label" for="allowed-person-name"> Allowed person full name: </label>
          <input type="text" class="form__input" id="allowed-person-name" name="allowed-person-name" required />
        </div>
        <div class="form__group">
          <label class="form__label" for="allowed-person-phone-number"> Allowed person phone number: </label>
          <input type="tel" class="form__input" id="allowed-person-phone-number" name="allowed-person-phone-number" required />
        </div>
        <div class="form__group add-account-savebtn">
          <button type="submit" class="btn btn--blue btn--small"> Save </button>
        </div>
      </form>
      <button class="btn btn--white btn--small add-account-cancel-btn border-black"> Cancel </button>
    `);
    // IMAGES TODO             <option value="3"> Images </option>
  
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    listenOnForm();
  }

  function listenOnForm() {
    const form = document.querySelector('.form-add-account');
    const cancelBtn = document.querySelector('.add-account-cancel-btn');

    if (cancelBtn) {
      cancelBtn.addEventListener('click', removeModal)
    }

    function removeModal() {
        const wholeModal = document.querySelector('.modal-overlay')
        wholeModal.remove();
    }

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const accountLogin = form.querySelector('#account-login').value;
        const accountPassword = form.querySelector('#account-password').value;
        const allowedPersonName = form.querySelector('#allowed-person-name').value;
        const allowedPersonPhoneNumber = form.querySelector('#allowed-person-phone-number').value;
        
        const accountTypeVal = form.querySelector("#account-type").value;

        let accountType = "";
        if (accountTypeVal == 0) {accountType = "FACEBOOK"}
        else if (accountTypeVal == 1) {accountType = "GOOGLE"}
        else if (accountTypeVal == 2) {accountType = "INSTAGRAM"}

        try {
          const savebtn = form.querySelector('.add-account-savebtn button');
          savebtn.innerHTML = "Saving...";
          savebtn.disabled = true;
          cancelBtn.disabled = true;
          cancelBtn.style.cursor = "not-allowed";

          const res = await fetch('/api/v1/users/add-account', {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({accountType, accountLogin, accountPassword, allowedPersonName, allowedPersonPhoneNumber}),
          });

          const data = await res.json();

          savebtn.innerHTML = "Save";
          savebtn.disabled = false;
          cancelBtn.disabled = false;
          cancelBtn.style.cursor = "pointer";
  
          if (data?.status === 'success') {
            showInfoPopup(data);
            removeModal();
            navigateTo("/my-apps");
            return;
          }

          throw data;
        } catch(err) {
          showInfoPopup(err);
          if (err.statusCode === 401) {
            navigateTo("/login");
          }
        }
      });
    }
  }

  myAppsContainer.addEventListener('click', async (e) => {
    if (!e.target.classList.contains('delete-acc-btn')) {return;}


    // zabezpieczenie haslem
    const deleteBtn = e.target;
    deleteBtn.innerHTML = "Deleting...";

    const closestAccount = deleteBtn.closest('.account-area');
    const id = closestAccount.dataset.id;

    try {
      const res = await fetch(`/api/v1/users/delete-connected-account/${id}`, {
        method: "DELETE",
        headers: {"Content-Type" : "application/json"}
      });

      const data = await res.json();

      deleteBtn.innerHTML = "Delete connected account";
      if (data?.status === 'success') {
        showInfoPopup(data);
        navigateTo('/my-apps');
      }

      throw data;
    } catch (err) {
      showInfoPopup(err);
      if (err.statusCode === 401) {
        navigateTo("/login");
      }
    }
  })
}

/* TO DOOOO */
  if (subscriptionPlansCont) {
    subscriptionPlansCont.addEventListener('click', async (e) => {
      if (e.target.tagName === "BUTTON") {
        const { type } = e.target.closest('.sub-area').dataset;

        location.assign(`/payment/${type}`)
      }
    })
  }

  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      try {
        const email = document.querySelector(".forgot-password-form #email").value
        const res = await fetch('/api/v1/users/forgot-password', {
          method: "POST",
          headers: { "Content-type": "application/json" },
          body: JSON.stringify({email}),
        })

        const data = await res.json();

        if (data?.status === "success") {
          showInfoPopup(data);
          return;
        }

        throw data;
      } catch (err) {
      showInfoPopup(err);
      }
    })
  }

  function navigateTo(path) {
    window.setTimeout(() => {
      location.assign(path);
    }, 1000);
  
  }
  function showInfoPopup(data) {
    /* Status = fail/error/success, message */
  
    const popup = document.createElement("div");
    popup.className = `info-popup ${data?.status}`;
  
    const upperPart = document.createElement("div");
    upperPart.className = "info-popup--upperpart";
    upperPart.innerHTML = data?.status?.toUpperCase() ?? "INFO";
  
    const messagePart = document.createElement("div");
    messagePart.className = "info-popup--messagepart";
    messagePart.innerHTML = data?.message || "Action successful.";
  
    popup.appendChild(upperPart);
    popup.appendChild(messagePart);
  
    document.body.appendChild(popup);
  
    setTimeout(() => {
      document.body.removeChild(popup);
    }, 3000);
  }
})();

