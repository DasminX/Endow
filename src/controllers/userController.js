const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const factory = require("./handlerFactory");

const checkUserLimits = (subscription, connectedAccounts, accountType) => {
  const userFacebookAccounts = connectedAccounts.filter(el=> el.accountType === "FACEBOOK").length;
  const userGoogleAccounts = connectedAccounts.filter(el=> el.accountType === "GOOGLE").length;
  const userTwitterAccounts = connectedAccounts.filter(el=> el.accountType === "TWITTER").length;
  const userInstagramAccounts = connectedAccounts.filter(el=> el.accountType === "INSTAGRAM").length;

  switch (subscription) {
    case "BASIC":
      if (accountType === "FACEBOOK" && userFacebookAccounts === 1) {return true;}
      if (accountType === "GOOGLE" && userGoogleAccounts === 1) {return true;}
      if (accountType === "TWITTER" && userTwitterAccounts === 1) {return true;}
      if (accountType === "INSTAGRAM" && userInstagramAccounts === 1) {return true;}
    break;
    case "PREMIUM":
      if (accountType === "FACEBOOK" && userFacebookAccounts === 3) {return true;}
      if (accountType === "GOOGLE" && userGoogleAccounts === 3) {return true;}
      if (accountType === "TWITTER" && userTwitterAccounts === 3) {return true;}
      if (accountType === "INSTAGRAM" && userInstagramAccounts === 3) {return true;}
    break;
    case "PRO":
      if (accountType === "FACEBOOK" && userFacebookAccounts === 5) {return true;}
      if (accountType === "GOOGLE" && userGoogleAccounts === 5) {return true;}
      if (accountType === "TWITTER" && userTwitterAccounts === 5) {return true;}
      if (accountType === "INSTAGRAM" && userInstagramAccounts === 5) {return true;}
    break;
  }

  return false;
}

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  const { password, passwordConfirm, username, email } = req.body;

  if (password || passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password updates. Please use /updateMyPassword.",
        400
      )
    );
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { username, email },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});


exports.addAccount = catchAsync(async (req, res, next) => {
  const {accountType, accountLogin, accountPassword, allowedPersonName, allowedPersonPhoneNumber} = req.body;

  const user = await User.findById(req.user.id);

  const isLimit = checkUserLimits(user.subscription, user.connectedAccounts, accountType);
  if (isLimit) {return next(new AppError(`You can't save another ${accountType.toLowerCase()} account with your subscription plan!`, 403))}

  // hash incoming acc's login and password - security
  const {accountHashedLogin, accountHashedPassword} = await user.hashAccountCredentials(accountLogin, accountPassword);
  const addedAt = Date.now();

  user.connectedAccounts.push({accountType, accountLogin: accountHashedLogin, accountPassword: accountHashedPassword, addedAt, allowedPersonName, allowedPersonPhoneNumber});
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Successfully added an account!",
  })
});

exports.deleteConnectedAccount = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) {return next(new AppError("Something went wrong! Try again later."), 500)}

    user.connectedAccounts = user.connectedAccounts.filter(acc=> acc.id != id);
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Successfully deleted a connected account."
    })
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});


// ADMIN ROUTES - NOT PANEL DEFINED YET, ONLY POSSIBLE WITH API CALLS
exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
