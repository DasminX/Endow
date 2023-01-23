exports.getLoginForm = (req, res) => {
  res.status(200).render("authForm", {
    title: "Log into your account",
    signingUp: false,
  });
};

exports.getSignupForm = (req, res) => {
  res.status(200).render("authForm", {
    title: "Signup now",
    signingUp: true,
  });
}
;
exports.getForgotPasswordForm = (req, res) => {
  res.status(200).render("forgotPassword", {
    title: "Forgot Password"
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render("accountSettings", {
    title: "Your account",
    path: req.path
  });
};

exports.getMyApps = (req, res) => {
  const numOfAccountsPossibleToConnect = req.user.subscription === "BASIC" ? 3 : req.user.subscription === "PREMIUM" ? 8 : 15;

  res.status(200).render("accountMyApps", {
    title: "Your apps",
    path: req.path,
    subscription: req.user.subscription,
    numOfAccountsPossibleToConnect,
    connectedAccounts: req.user.connectedAccounts
  });
}

exports.getSubscription = (req, res) => {
  const subscriptionPlans = [
    {type: "BASIC", features: ["Up to three accounts saved", "Max one account per service", "Max 100 photos to upload (max size: 1MB)", "Basic contact with our support (mon-fri, 9am-4pm)"], price: 19.99},
    {type: "PREMIUM", features: ["Up to eight accounts saved", "Max two accounts per service", "Max 500 photos to upload (max size: 3MB)", "Unlimited contact with our support (24/7)"], price: 39.99},
    {type: "PRO", features: ["Up to fifteen accounts saved", "Max three accounts per service", "Max 2000 photos to upload (max size: 5MB)", "Unlimited contact with our support (24/7)", "Constant contact with our lawyer"], price: 79.99},
  ];

  res.status(200).render("accountSubscription", {
    title: "Subscription",
    path: req.path,
    subscriptionPlans,
    userSubscription: req.user.subscription
  });
};

exports.getHomepage = (req, res) => {
  // TO DO PANEL
  const trustedUsers = [
    {name: "Johnny Mielony", img: "/img/users/johnny-mielony.jpg", aos: "fade-right" }, 
    {name: "Zosia Samosia", img: "/img/users/zosia-samosia.jpg", aos: "fade-down" }, 
    {name: "Andrew Gitara", img: "/img/users/andrew-gitara.jpg", aos: "fade-left" }
  ];

  res.status(200).render("home", {
    title: "Home",
    trustedUsers
  });
};
