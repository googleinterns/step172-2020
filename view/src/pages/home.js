import React, { Component } from "react";
import axios from "axios";

import Account from "../components/account";
import Deal from "../components/deal";
import Produce from "../components/produce";
import Surplus from "../components/surplus";
import Farms from "../components/farms";
import FoodBanks from "../components/foodbanks";
import Alert from "../extras/alert";

import Drawer from "@material-ui/core/Drawer";
import AppBar from "@material-ui/core/AppBar";
import CssBaseline from "@material-ui/core/CssBaseline";
import Toolbar from "@material-ui/core/Toolbar";
import List from "@material-ui/core/List";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import withStyles from "@material-ui/core/styles/withStyles";
import AccountBoxIcon from "@material-ui/icons/AccountBox";
import NatureIcon from "@material-ui/icons/LocalFlorist";
import BankIcon from "@material-ui/icons/HomeWork";
import DealIcon from "@material-ui/icons/Telegram";
import ChartIcon from "@material-ui/icons/ShowChart";
import EcoIcon from "@material-ui/icons/Eco";
import Avatar from "@material-ui/core/Avatar";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import CircularProgress from "@material-ui/core/CircularProgress";

import { authMiddleWare } from "../util/auth";

const drawerWidth = 240;
const styles = (theme) => ({
  root: {
    display: "flex",
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  drawer: {
    width: drawerWidth,
    flexShrink: "0px",
  },
  drawerPaper: {
    width: drawerWidth,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  contentContainer: {
    width: "80%",
  },
  avatar: {
    height: "64px",
    width: "64px",
    flexShrink: "0px",
    flexGrow: "0px",
    marginTop: "20px",
  },
  uiProgess: {
    position: "fixed",
    zIndex: "1000",
    height: "32px",
    width: "32px",
    left: "50%",
    top: "35%",
  },
  toolbar: theme.mixins.toolbar,
  selected: {
    color: theme.palette.primary.white,
    backgroundColor: theme.palette.primary.main,
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  selectedIcon: {
    color: theme.palette.primary.white,
    transparent: true,
  },
  center: {
    textAlign: "center",
  },
});

/**
 * The Home component comprises the structure of the home page which
 * is able to load in all the other component pages (in components directory).
 * It contains the Toolbar at the top of the page and a Drawer that provides
 * acccess to all the component pages. In addition, it controls the alert
 * component accross any child of the home page.
 */
class Home extends Component {
  /** Opens an alert in the snackbar at the bottom of the page */
  openAlert = () => {
    localStorage.setItem("showAlert", "true");
    this.setState({ showAlert: true });
  };

  /** Closes an alert in the snackbar at the bottom of the page */
  closeAlert = () => {
    localStorage.setItem("showAlert", "false");
    this.setState({ showAlert: false });
  };

  /**
   * Creates an alert with the severity and message provided as parameters.
   * This function will passed to the children of home to allow them to call
   * the alert aparatus.
   */
  alert = (newSeverity, newMessage) => {
    localStorage.setItem("severity", newSeverity);
    localStorage.setItem("message", newMessage);
    this.setState({
      severity: newSeverity,
      message: newMessage,
    });
    this.openAlert();
  };

  /**
   * This function gets a value from local storage with name. If that value is not
   * found in local storage, it will return the standard value provided as a param.
   */
  getStorage = (name, standardVal) => {
    const storedContent = localStorage.getItem(name) || standardVal;
    return {
      storedContent,
    };
  };

  /** Loads the account page (and stores in local storage to remember after page reload) */
  loadAccountPage = (event) => {
    localStorage.setItem("toRender", "account");
    this.setState({ toRender: "account" });
  };

  /** Loads the deals page (and stores in local storage to remember after page reload) */
  loadTodoPage = (event) => {
    localStorage.setItem("toRender", "deals");
    this.setState({ toRender: "deals" });
  };

  /** Loads the produce page (and stores in local storage to remember after page reload) */
  loadProducePage = (event) => {
    localStorage.setItem("toRender", "produce");
    this.setState({ toRender: "produce" });
  };

  /** Loads the surplus page (and stores in local storage to remember after page reload) */
  loadSurplusPage = (event) => {
    localStorage.setItem("toRender", "surplus");
    this.setState({ toRender: "surplus" });
  };

  /** Loads the farms page (and stores in local storage to remember after page reload) */
  loadFarmsPage = (event) => {
    localStorage.setItem("toRender", "farms");
    this.setState({ toRender: "farms" });
  };

  /** Loads the food banks page (and stores in local storage to remember after page reload) */
  loadFoodBanksPage = (event) => {
    localStorage.setItem("toRender", "foodbanks");
    this.setState({ toRender: "foodbanks" });
  };

  /** Logs the user out of the web application (by removing bearer token from local storage) */

  logoutHandler = (event) => {
    localStorage.removeItem("AuthToken");
    this.props.history.push("/login");
  };

  /** Determines whether "selected" CSS should be applied to a page. Only applies to current page. */
  isSelected = (name) => {
    return this.state.toRender === name;
  };

  constructor(props) {
    super(props);

    this.state = {
      // Get values from local storage or load default values
      toRender: this.getStorage("toRender", "deals")["storedContent"],
      showAlert:
        this.getStorage("showAlert", "false")["storedContent"] === "true",
      severity: this.getStorage("severity", "")["storedContent"],
      message: this.getStorage("message", "")["storedContent"],
      // User states - set to default value
      firstName: "",
      lastName: "",
      imageLoading: false,
      profilePicture: "",
      // Page state - set to default value
      uiLoading: true,
    };
  }

  /** Returns the authentication token stored in local storage */
  getAuth = () => {
    authMiddleWare(this.props.history);
    return localStorage.getItem("AuthToken");
  };

  /** Load in the user's information when the component has mounted */
  componentDidMount() {
    axios.defaults.headers.common = { Authorization: `${this.getAuth()}` };
    axios
      .get("/user")
      .then((response) => {
        console.log(this.state);
        this.setState({
          // user states
          firstName: response.data.userCredentials.firstName,
          lastName: response.data.userCredentials.lastName,
          email: response.data.userCredentials.email,
          phoneNumber: response.data.userCredentials.phoneNumber,
          country: response.data.userCredentials.country,
          username: response.data.userCredentials.username,
          profilePicture: response.data.userCredentials.imageUrl,
          // page state
          uiLoading: false,
        });
      })
      .catch((error) => {
        if (error.response.status === 403) {
          this.props.history.push("/login");
        }
        console.log(error);
        this.setState({ errorMsg: "Error in retrieving the data" });
      });
  }

  render() {
    const { classes } = this.props;
    if (this.state.uiLoading === true) {
      return (
        <div className={classes.root}>
          {this.state.uiLoading && (
            <CircularProgress size={150} className={classes.uiProgess} />
          )}
        </div>
      );
    } else {
      return (
        <div className={classes.root}>
          <CssBaseline />
          <AppBar position="fixed" className={classes.appBar} color="primary">
            <Toolbar>
              <Typography variant="h6" noWrap>
                The FarmLink Project
              </Typography>
            </Toolbar>
          </AppBar>
          <Drawer
            className={classes.drawer}
            variant="permanent"
            classes={{
              paper: classes.drawerPaper,
            }}
          >
            <div className={classes.toolbar} />
            <Divider />
            <div className={classes.center}>
              <Avatar
                src={this.state.profilePicture}
                className={classes.avatar}
              />
              <p>
                {this.state.firstName} {this.state.lastName}
              </p>
            </div>
            <Divider />
            <List>
              <ListItem
                button
                className={this.isSelected("farms") && classes.selected}
                key="Farms"
                onClick={this.loadFarmsPage}
              >
                <ListItemIcon>
                  <NatureIcon
                    className={this.isSelected("farms") && classes.selectedIcon}
                  />
                </ListItemIcon>
                <ListItemText primary="Farms" />
              </ListItem>
              <ListItem
                className={this.isSelected("foodbanks") && classes.selected}
                button
                key="Food Banks"
                onClick={this.loadFoodBanksPage}
              >
                <ListItemIcon>
                  <BankIcon
                    className={
                      this.isSelected("foodbanks") && classes.selectedIcon
                    }
                  />
                </ListItemIcon>
                <ListItemText primary="Food Banks" />
              </ListItem>
              <ListItem
                button
                className={this.isSelected("deals") && classes.selected}
                key="Deals"
                onClick={this.loadTodoPage}
              >
                <ListItemIcon>
                  <DealIcon
                    className={this.isSelected("deals") && classes.selectedIcon}
                  />
                </ListItemIcon>
                <ListItemText primary="Deals" />
              </ListItem>
              <ListItem
                button
                className={this.isSelected("surplus") && classes.selected}
                key="Surplus"
                onClick={this.loadSurplusPage}
              >
                <ListItemIcon>
                  <ChartIcon
                    className={
                      this.isSelected("surplus") && classes.selectedIcon
                    }
                  />
                </ListItemIcon>
                <ListItemText primary="Surplus" />
              </ListItem>
              <ListItem
                button
                className={this.isSelected("produce") && classes.selected}
                key="Produce"
                onClick={this.loadProducePage}
              >
                <ListItemIcon>
                  <EcoIcon
                    className={
                      this.isSelected("produce") && classes.selectedIcon
                    }
                  />
                </ListItemIcon>
                <ListItemText primary="Produce" />
              </ListItem>
              <ListItem
                button
                className={this.isSelected("account") && classes.selected}
                key="Account"
                onClick={this.loadAccountPage}
              >
                <ListItemIcon>
                  <AccountBoxIcon
                    className={
                      this.isSelected("account") && classes.selectedIcon
                    }
                  />
                </ListItemIcon>
                <ListItemText primary="Account" />
              </ListItem>
              <ListItem button key="Logout" onClick={this.logoutHandler}>
                <ListItemIcon>
                  <ExitToAppIcon />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItem>
            </List>
          </Drawer>

          <div className={classes.contentContainer}>
            {/* The alert component that is activated by any child of the home page */}
            <Alert
              open={this.state.showAlert}
              handleOpen={this.openAlert}
              handleClose={this.closeAlert}
              severity={this.state.severity}
              message={this.state.message}
            />
            {/* Load in the content of the selected component page */}
            {this.state.toRender === "deals" ? (
              <Deal alert={this.alert} />
            ) : this.state.toRender === "account" ? (
              <Account alert={this.alert} />
            ) : this.state.toRender === "produce" ? (
              <Produce alert={this.alert} />
            ) : this.state.toRender === "surplus" ? (
              <Surplus alert={this.alert} main={true} />
            ) : this.state.toRender === "farms" ? (
              <Farms alert={this.alert} />
            ) : (
              <FoodBanks alert={this.alert} main={true} />
            )}
          </div>
        </div>
      );
    }
  }
}

export default withStyles(styles)(Home);
