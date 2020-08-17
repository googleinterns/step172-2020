import React, { Component } from "react";

import Address from "../extras/address";

import withStyles from "@material-ui/core/styles/withStyles";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Slide from "@material-ui/core/Slide";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import Container from "@material-ui/core/Container";
import CardActions from "@material-ui/core/CardActions";
import CircularProgress from "@material-ui/core/CircularProgress";
import CardContent from "@material-ui/core/CardContent";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import MuiDialogContent from "@material-ui/core/DialogContent";
import InputBase from "@material-ui/core/InputBase";
import Chip from "@material-ui/core/Chip";
import SearchIcon from "@material-ui/icons/Search";
import InputAdornment from "@material-ui/core/InputAdornment";
import Box from "@material-ui/core/Box";
import Autocomplete from "@material-ui/lab/Autocomplete";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import PropTypes from "prop-types";
import MaskedInput from "react-text-mask";
import OutlinedInput from "@material-ui/core/OutlinedInput";

import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { authMiddleWare } from "../util/auth";

const TAG_EXAMPLES = [
  { title: "High Food Insecurity" },
  { title: "Major City" },
];

const styles = (theme) => ({
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  appBar: {
    position: "relative",
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
  submitButton: {
    display: "block",
    color: "white",
    textAlign: "center",
    position: "absolute",
    top: "14px",
    right: "10px",
  },
  floatingButton: {
    position: "fixed",
    bottom: "0px",
    right: "0px",
  },
  form: {
    width: "calc(100% - 32px)",
    marginLeft: "12px",
    marginTop: theme.spacing(3),
  },
  toolbar: theme.mixins.toolbar,
  root: {
    minWidth: "470px",
  },
  bullet: {
    display: "inline-block",
    margin: "0 2px",
    transform: "scale(0.8)",
  },
  pos: {
    marginBottom: "12px",
  },
  uiProgess: {
    position: "fixed",
    zIndex: "1000",
    height: "32px",
    width: "32px",
    left: "50%",
    top: "35%",
  },
  dialogStyle: {
    maxWidth: "50%",
  },
  viewRoot: {
    margin: "0px",
    padding: theme.spacing(2),
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  search: {
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    marginLeft: "0px",
    width: "100%",
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  inputRoot: {
    color: "inherit",
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    width: "100%",
  },
  chip: {
    margin: "4px",
  },
  foodbankLocation: {
    maxWidth: "280px",
  },
});

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

/**
 * Sets up the mask used for the phone input of (***) ***-****
 * where * represents a digit
 */
function TextMaskCustom(props) {
  const { inputRef, ...other } = props;

  return (
    <MaskedInput
      {...other}
      ref={(ref) => {
        inputRef(ref ? ref.inputElement : null);
      }}
      mask={[
        "(",
        /[1-9]/,
        /\d/,
        /\d/,
        ")",
        " ",
        /\d/,
        /\d/,
        /\d/,
        "-",
        /\d/,
        /\d/,
        /\d/,
        /\d/,
      ]}
      placeholderChar={"\u2000"}
      showMask
    />
  );
}

TextMaskCustom.propTypes = {
  inputRef: PropTypes.func.isRequired,
};

/**
 * Represents a Food Bank component, which is a sub-page of the
 * home page where food bank objects are visualized, created, updated, edited,
 * and deleted.
 */
class Foodbank extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // food bank states
      foodbanks: "",
      foodbankName: "",
      location: "",
      locationId: "",
      hours: "",
      foodbankId: "",
      contactPhone: "(1  )    -    ",
      contactName: "",
      contactEmail: "",
      forklift: false,
      pallet: false,
      loadingDock: false,
      maxLoadSize: "",
      refrigerationSpaceAvailable: "",
      foodbankTags: [],
      // page states
      errors: [],
      open: false, // used for opening food banks edit/create dialog (form)
      uiLoading: true,
      buttonType: "",
      viewOpen: false, // used for opening food banks view dialog
    };

    this.handleDelete = this.handleDelete.bind(this);
    this.handleEditClick = this.handleEditClick.bind(this);
    this.handleViewOpen = this.handleViewOpen.bind(this);
  }

  /**
   * Given an event, this function updates a state (the target of the event)
   * with a new value
   * @param event The event that is attempting to update a state
   */
  handleChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value,
    });
  };

  /** Used to uncheck and check the form checkboxes */
  handleChecked = (name) => (event) => {
    this.setState({ [name]: event.target.checked });
  };

  /** Used to update tags in form */
  onTagsChange = (event, values) => {
    this.setState({
      // food bank state
      farmTags: values,
    });
  };

  /** Used to update location from address autocomplete component */
  handleLocation = (newValue) => {
    if (newValue === null) {
      return;
    }
    this.setState({
      location: newValue.description,
      locationId: newValue.place_id,
    });
  };

  /** Returns the authentication token stored in local storage */
  getAuth = () => {
    authMiddleWare(this.props.history);
    return localStorage.getItem("AuthToken");
  };

  /** Load in all of the current food banks when the component has mounted */
  componentDidMount() {
    axios.defaults.headers.common = { Authorization: `${this.getAuth()}` };
    axios
      .get("/foodbanks")
      .then((response) => {
        this.setState({
          foodbanks: response.data,
          uiLoading: false,
        });
      })
      .catch((err) => {
        console.error(err);
      });
  }

  /**
   * Takes a food bank object as an input and deletes the given food bank
   * object from the database
   * @param data A food bank object
   */
  handleDelete(data) {
    authMiddleWare(this.props.history);
    const authToken = localStorage.getItem("AuthToken");
    axios.defaults.headers.common = { Authorization: `${authToken}` };
    let foodbankId = data.foodbank.foodbankId;
    axios
      .delete(`foodbanks/${foodbankId}`)
      .then(() => {
        window.location.reload();
      })
      .catch((err) => {
        console.error(err);
      });
  }

  /**
   * Takes a food bank object as an input and opens a dialog page to
   * allow the user to update the attributes of the food bank object
   * @param data A food bank object
   */
  handleEditClick(data) {
    this.setState({
      // food bank states
      foodbankName: data.foodbank.foodbankName,
      location: data.foodbank.location,
      locationId: data.foodbank.locationId,
      hours: data.foodbank.hours,
      foodbankId: data.foodbank.foodbankId,
      contactPhone: data.foodbank.contactPhone,
      contactName: data.foodbank.contactName,
      contactEmail: data.foodbank.contactEmail,
      forklift: data.foodbank.forklift,
      pallet: data.foodbank.pallet,
      loadingDock: data.foodbank.loadingDock,
      maxLoadSize: data.foodbank.maxLoadSize,
      refrigerationSpaceAvailable: data.foodbank.refrigerationSpaceAvailable,
      foodbankTags: data.foodbank.foodbankTags,
      // page states
      buttonType: "Edit",
      open: true,
    });
  }

  /**
   * Takes a food bank object as an input and opens a popup with all the
   * information about the food bank (currently not being used -> will be
   * updated to show augmented information)
   * @param data A food bank object
   */
  handleViewOpen(data) {
    this.setState({
      // food bank states
      foodbankName: data.foodbank.foodbankName,
      location: data.foodbank.location,
      locationId: data.foodbank.locationId,
      hours: data.foodbank.hours,
      contactPhone: data.foodbank.contactPhone,
      contactName: data.foodbank.contactName,
      contactEmail: data.foodbank.contactEmail,
      forklift: data.foodbank.forklift,
      pallet: data.foodbank.pallet,
      loadingDock: data.foodbank.loadingDock,
      maxLoadSize: data.foodbank.maxLoadSize,
      refrigerationSpaceAvailable: data.foodbank.refrigerationSpaceAvailable,
      foodbankTags: data.foodbank.foodbankTags,
      // page states
      viewOpen: true,
    });
  }

  render() {
    const DialogTitle = withStyles(styles)((props) => {
      const { children, classes, onClose, ...other } = props;
      return (
        <MuiDialogTitle disableTypography className={classes.root} {...other}>
          <Typography variant="h6">{children}</Typography>
          {onClose ? (
            <IconButton
              aria-label="close"
              className={classes.closeButton}
              onClick={onClose}
            >
              <CloseIcon />
            </IconButton>
          ) : null}
        </MuiDialogTitle>
      );
    });

    const DialogContent = withStyles((theme) => ({
      viewRoot: {
        padding: theme.spacing(2),
      },
    }))(MuiDialogContent);

    dayjs.extend(relativeTime);
    const { classes } = this.props;
    const { open, errors, viewOpen } = this.state;

    /** Set all states to generic value when opening a dialog page */
    const handleAddClick = () => {
      this.setState({
        // food bank states
        foodbankName: "",
        location: "",
        locationId: "",
        hours: "",
        foodbankId: "",
        contactPhone: "(1  )    -    ",
        contactName: "",
        contactEmail: "",
        forklift: false,
        pallet: false,
        loadingDock: false,
        maxLoadSize: "",
        refrigerationSpaceAvailable: "",
        foodbankTags: [],
        // page state
        open: true,
      });
    };

    /**
     * Either updates or submits a new food bank object to the data base
     * @param event The event being handled
     */
    const handleSubmit = (event) => {
      authMiddleWare(this.props.history);
      event.preventDefault();
      const newFoodBank = {
        // food bank states
        foodbankName: this.state.foodbankName,
        location: this.state.location,
        locationId: this.state.locationId,
        hours: this.state.hours,
        contactPhone: this.state.contactPhone,
        contactName: this.state.contactName,
        contactEmail: this.state.contactEmail,
        forklift: this.state.forklift,
        pallet: this.state.pallet,
        loadingDock: this.state.loadingDock,
        maxLoadSize: parseFloat(this.state.maxLoadSize),
        refrigerationSpaceAvailable: parseFloat(
          this.state.refrigerationSpaceAvailable
        ),
        foodbankTags: this.state.foodbankTags,
      };
      let options = {};
      if (this.state.buttonType === "Edit") {
        options = {
          url: `/foodbanks/${this.state.foodbankId}`,
          method: "put",
          data: newFoodBank,
        };
      } else {
        options = {
          url: "/foodbanks",
          method: "post",
          data: newFoodBank,
        };
      }
      const authToken = localStorage.getItem("AuthToken");
      axios.defaults.headers.common = { Authorization: `${authToken}` };
      axios(options)
        .then(() => {
          // page state
          this.setState({ open: false });
          window.location.reload();
        })
        .catch((error) => {
          // page state
          this.setState({ open: true, errors: error.response.data });
          console.error(error);
        });
    };

    const handleViewClose = () => {
      // page state
      this.setState({ viewOpen: false });
    };

    const handleDialogClose = (event) => {
      // page state
      this.setState({ open: false });
    };

    if (this.state.uiLoading === true) {
      return (
        <main className={classes.content}>
          <div className={classes.toolbar} />
          {this.state.uiLoading && (
            <CircularProgress size={150} className={classes.uiProgess} />
          )}
        </main>
      );
    } else {
      return (
        <main className={classes.content}>
          <div className={classes.toolbar} />

          <IconButton
            className={classes.floatingButton}
            color="primary"
            aria-label="Add Food Bank"
            onClick={handleAddClick}
          >
            <AddCircleIcon style={{ fontSize: 60 }} />
          </IconButton>
          <Dialog
            fullScreen
            open={open}
            onClose={handleDialogClose}
            TransitionComponent={Transition}
          >
            <AppBar className={classes.appBar}>
              <Toolbar>
                <IconButton
                  edge="start"
                  color="inherit"
                  onClick={handleDialogClose}
                  aria-label="close"
                >
                  <CloseIcon />
                </IconButton>
                <Typography variant="h6" className={classes.title}>
                  {this.state.buttonType === "Edit"
                    ? "Edit Food Bank"
                    : "Create a new Food Bank"}
                </Typography>
                <Button
                  autoFocus
                  color="inherit"
                  onClick={handleSubmit}
                  className={classes.submitButton}
                >
                  {this.state.buttonType === "Edit" ? "Save" : "Submit"}
                </Button>
              </Toolbar>
            </AppBar>
            <Container maxWidth="lg">
              <form className={classes.form} noValidate>
                <Grid container spacing={4} alignItems="center">
                  <Grid item xs={6}>
                    <TextField
                      variant="outlined"
                      required
                      fullWidth
                      id="foodbankName"
                      label="Food Bank Name"
                      name="foodbankName"
                      type="text"
                      autoComplete="foodbankName"
                      helperText={errors.foodbankName}
                      value={this.state.foodbankName}
                      error={errors.foodbankName ? true : false}
                      onChange={this.handleChange}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Address
                      handleLocation={this.handleLocation}
                      location={this.state.location}
                    />
                    {/* can we get the hours from the location query? */}
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      variant="outlined"
                      required
                      fullWidth
                      id="contactName"
                      label="Point of Contact - Name"
                      name="contactName"
                      type="text"
                      autoComplete="contactName"
                      helperText={errors.contactName}
                      value={this.state.contactName}
                      error={errors.contactName ? true : false}
                      onChange={this.handleChange}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <FormControl fullWidth>
                      <InputLabel variant="outlined" htmlFor="contactPhone">
                        Point of Contact - Phone
                      </InputLabel>
                      <OutlinedInput
                        label="Point of Contact - Phone"
                        value={this.state.contactPhone}
                        onChange={this.handleChange}
                        helperText={errors.contactPhone}
                        error={errors.contactPhone ? true : false}
                        name="contactPhone"
                        id="contactPhone"
                        inputComponent={TextMaskCustom}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      variant="outlined"
                      required
                      fullWidth
                      id="contactEmail"
                      label="Point of Contact - Email"
                      name="contactEmail"
                      type="email"
                      autoComplete="contactEmail"
                      helperText={errors.contactEmail}
                      value={this.state.contactEmail}
                      error={errors.contactEmail ? true : false}
                      onChange={this.handleChange}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={this.state.loadingDock}
                          onChange={this.handleChecked("loadingDock")}
                          value={"loadingDock"}
                          name="loadingDock"
                          color="primary"
                        />
                      }
                      label="Loading Doc Present"
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={this.state.forklift}
                          onChange={this.handleChecked("forklift")}
                          value={"forklift"}
                          name="forklift"
                          color="primary"
                        />
                      }
                      label="Forklift Present"
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={this.state.pallet}
                          onChange={this.handleChecked("pallet")}
                          value={"pallet"}
                          name="pallet"
                          color="primary"
                        />
                      }
                      label="Pallet Present"
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      variant="outlined"
                      required
                      fullWidth
                      id="maxLoadSize"
                      label="Max Load Size"
                      name="maxLoadSize"
                      type="number"
                      autoComplete="maxLoadSize"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            pallets
                          </InputAdornment>
                        ),
                      }}
                      helperText={errors.maxLoadSize}
                      value={this.state.maxLoadSize}
                      error={errors.maxLoadSize ? true : false}
                      onChange={this.handleChange}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      variant="outlined"
                      required
                      fullWidth
                      id="refrigerationSpaceAvailable"
                      label="Refrigeration Space Available"
                      name="refrigerationSpaceAvailable"
                      type="number"
                      autoComplete="refrigerationSpaceAvailable"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            pallets
                          </InputAdornment>
                        ),
                      }}
                      helperText={errors.refrigerationSpaceAvailable}
                      value={this.state.refrigerationSpaceAvailable}
                      error={errors.refrigerationSpaceAvailable ? true : false}
                      onChange={this.handleChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Autocomplete
                      multiple
                      id="tags-filled"
                      onChange={this.onTagsChange}
                      options={TAG_EXAMPLES.map((option) => option.title)}
                      defaultValue={[this.state.foodbankTags]}
                      freeSolo
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip label={option} {...getTagProps({ index })} />
                        ))
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          label="Food Bank Tags"
                          placeholder="tags..."
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </form>
            </Container>
          </Dialog>
          <Container maxWidth="lg">
            <Grid container spacing={2} alignItem="center">
              <Grid item xs={12}>
                <div className={classes.search}>
                  <div className={classes.searchIcon}>
                    <SearchIcon />
                  </div>
                  <InputBase
                    fullWidth={true}
                    placeholder="Search…"
                    classes={{
                      root: classes.inputRoot,
                      input: classes.inputInput,
                    }}
                    inputProps={{ "aria-label": "search" }}
                  />
                </div>
              </Grid>
              {this.state.foodbanks.map((foodbank) => (
                <Grid item xs={12}>
                  <Card className={classes.root} variant="outlined">
                    <CardContent>
                      <Typography variant="h5" component="h2">
                        {foodbank.foodbankName}
                      </Typography>
                      <Chip
                        className={classes.chip}
                        label="High Food Insecurity"
                        size="small"
                      />
                      <Chip
                        className={classes.chip}
                        label="Major City"
                        size="small"
                      />
                      <Box
                        display="flex"
                        flexDirection="row"
                        flexWrap="wrap"
                        p={0}
                        m={0}
                      >
                        <Box p={3}>
                          <Typography
                            className={classes.pos}
                            color="textSecondary"
                          >
                            Details:
                          </Typography>
                          <Typography
                            variant="body2"
                            component="p"
                            className={classes.foodbankLocation}
                          >
                            Location of Food Bank: {foodbank.location}
                            <br />
                            Refrigeration Space (in pallets):
                            {foodbank.refrigerationSpaceAvailable}
                            <br />
                            Max Load Size (in pallets): {foodbank.maxLoadSize}
                          </Typography>
                        </Box>
                        <Box p={3}>
                          <Typography
                            className={classes.pos}
                            color="textSecondary"
                          >
                            Point of Contact:
                          </Typography>
                          <Typography variant="body2" component="p">
                            Name: {foodbank.contactName}
                            <br />
                            Phone: {foodbank.contactPhone}
                            <br />
                            Email: {foodbank.contactEmail}
                          </Typography>
                        </Box>
                        <Box p={3}>
                          <Typography
                            className={classes.pos}
                            color="textSecondary"
                          >
                            Logistics:
                          </Typography>
                          <Typography variant="body2" component="p">
                            Forklift: {foodbank.forklift ? "yes" : "no"}
                            <br />
                            Pallet: {foodbank.pallet ? "yes" : "no"}
                            <br />
                            Loading Dock: {foodbank.loadingDock ? "yes" : "no"}
                          </Typography>
                        </Box>
                        {/* --> this will be implemented when we get hours from Place API <--
                        <Box p={3}>
                          <Typography
                            className={classes.pos}
                            color="textSecondary"
                          >
                            Hours of Operation:
                          </Typography>
                          <Typography variant="body2" component="p">
                            Monday-Friday: 9am - 5pm
                            <br />
                            Saturday: 10am - 4pm
                            <br />
                            Sunday: closed
                          </Typography>
                        </Box> */}
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        color="primary"
                        onClick={() => this.handleViewOpen({ foodbank })}
                      >
                        View
                      </Button>
                      <Button
                        size="small"
                        color="primary"
                        onClick={() => this.handleEditClick({ foodbank })}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="primary"
                        onClick={() => this.handleDelete({ foodbank })}
                      >
                        Delete
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>

          <Dialog
            onClose={handleViewClose}
            aria-labelledby="customized-dialog-title"
            open={viewOpen}
            fullWidth
            classes={{ paperFullWidth: classes.dialogStyle }}
          >
            <DialogTitle id="customized-dialog-title" onClose={handleViewClose}>
              {this.state.foodbankName}
            </DialogTitle>
            <DialogContent dividers>
              <Chip
                className={classes.chip}
                label="High Food Insecurity"
                size="small"
              />
              <Chip className={classes.chip} label="Major City" size="small" />
              <Box
                display="flex"
                flexDirection="row"
                flexWrap="wrap"
                p={0}
                m={0}
              >
                <Box p={3}>
                  <Typography className={classes.pos} color="textSecondary">
                    Details:
                  </Typography>
                  <Typography variant="body2" component="p">
                    Location of Food Bank: {this.state.location}
                    <br />
                    Refrigeration Space (in pallets):
                    {this.state.refrigerationSpaceAvailable}
                    <br />
                    Max Load Size (in pallets): {this.state.maxLoadSize}
                  </Typography>
                </Box>
                <Box p={3}>
                  <Typography className={classes.pos} color="textSecondary">
                    Point of Contact:
                  </Typography>
                  <Typography variant="body2" component="p">
                    Name: {this.state.contactName}
                    <br />
                    Phone: {this.state.contactPhone}
                    <br />
                    Email: {this.state.contactEmail}
                  </Typography>
                </Box>
                <Box p={3}>
                  <Typography className={classes.pos} color="textSecondary">
                    Logistics:
                  </Typography>
                  <Typography variant="body2" component="p">
                    Forklift: {this.state.forklift ? "yes" : "no"}
                    <br />
                    Pallet: {this.state.pallet ? "yes" : "no"}
                    <br />
                    Loading Dock: {this.state.loadingDock ? "yes" : "no"}
                  </Typography>
                </Box>
              </Box>
            </DialogContent>
          </Dialog>
        </main>
      );
    }
  }
}

export default withStyles(styles)(Foodbank);