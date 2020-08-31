import React, { Component } from "react";
import Address from "../extras/address_autocomplete_field";
import CardSkeletons from "../extras/skeleton";
import CustomTable from "../extras/table";

import withStyles from "@material-ui/core/styles/withStyles";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
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
import CardContent from "@material-ui/core/CardContent";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import MuiDialogContent from "@material-ui/core/DialogContent";
import Chip from "@material-ui/core/Chip";
import SearchIcon from "@material-ui/icons/Search";
import ClearIcon from "@material-ui/icons/Clear";
import Box from "@material-ui/core/Box";
import Autocomplete from "@material-ui/lab/Autocomplete";
import InputLabel from "@material-ui/core/InputLabel";
import InputAdornment from "@material-ui/core/InputAdornment";
import FormControl from "@material-ui/core/FormControl";
import PropTypes from "prop-types";
import MaskedInput from "react-text-mask";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { authMiddleWare } from "../util/auth";

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
    bottom: "16px",
    right: "16px",
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
    margin: 0,
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
    marginLeft: 0,
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
  farmLocation: {
    maxWidth: "280px",
  },
  tablePadding: {
    marginTop: "24px",
  },
});

/** Place holder for contact table data pulled from database */
let tableState = {
  columns: [
    { title: "Role", field: "contactRole" },
    { title: "Name", field: "contactName" },
    { title: "Email", field: "contactEmail" },
    { title: "Phone Number", field: "contactPhone" },
  ],
  data: [],
};

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

/**
 * This function sets up the mask used for the phone input of (***) ***-****
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
 * This class represents a Farm component, which is a sub-page of the
 * home page where farm objects are visualized, created, updated, edited,
 * and deleted.
 */
class Farms extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // Search states
      data: "",
      nameQuery: "",
      locationQuery: "",
      tagsQuery: [],
      filteredData: [],
      allFarmTags: [],
      // TODO: should this be updated as data gets filtered - yes ? realtime maybe not needed
      // asynch / wait for user to submit before filtering?
      // Farm states
      farms: "",
      farmName: "",
      farmId: "",
      farmTags: [],
      contacts: [],
      forklift: false,
      loadingDock: false,
      location: "",
      locationId: "",
      transportation: false,
      // Page states
      errors: [],
      open: false, //  Used for opening the farm edit/create dialog (form)
      uiLoading: true,
      buttonType: "",
      viewOpen: false, //  Used for opening the farm view dialog
    };

    this.onTagsChange = this.onTagsChange.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleEditClick = this.handleEditClick.bind(this);
    this.handleViewOpen = this.handleViewOpen.bind(this);

    this.handleNameSearch = this.handleNameSearch.bind(this);
    this.handleLocationSearch = this.handleLocationSearch.bind(this);
    this.simpleSearch = this.simpleSearch.bind(this);

    this.populateAllFarmTags = this.populateAllFarmTags.bind(this);
    this.handleTagFilter = this.handleTagFilter.bind(this);

    this.handleResultsRender = this.handleResultsRender.bind(this);
    this.resetCards = this.resetCards.bind(this);
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

  /** Iterate over all tags in filteredData to update tags for filtering by */
  // TODO: figure out why it doesn't work for initial data
  populateAllFarmTags = () => {
    const { filteredData } = this.state;
    var populatedTags = [];
    filteredData.map((data) =>
      populatedTags.push.apply(populatedTags, data.farmTags)
    );
    const populatedUniqueTags = [...new Set(populatedTags)];

    // set vs array here vs later ????
    console.log("pt arr", populatedTags);
    console.log("pt unique arr", populatedUniqueTags);

    this.setState({
      allFarmTags: populatedUniqueTags,
    });
  };

  /** Used to update tags in form */
  onTagsChange = (event, values) => {
    this.setState({
      // Farm state
      farmTags: values,
    });
  };

  changeContacts = (data) => {
    this.setState({ contacts: data });
  };

  /** Used to update location from address autocomplete component */
  handleLocation = (newValue) => {
    if (newValue === null) {
      return;
    }
    this.setState({
      // Farm states
      location: newValue.description,
      locationId: newValue.place_id,
    });
  };

  /** Returns the authentication token stored in local storage */
  getAuth = () => {
    authMiddleWare(this.props.history);
    return localStorage.getItem("AuthToken");
  };

  /** Load in all of the current farms when the component has mounted */
  componentDidMount() {
    axios.defaults.headers.common = { Authorization: `${this.getAuth()}` };
    axios
      .get("/farms")
      .then((response) => {
        this.setState({
          // Farm state
          data: response.data,
          filteredData: response.data,
          // Page state
          uiLoading: false,
        });
        this.populateAllFarmTags();
      })
      .catch((err) => {
        console.error(err);
      });
  }

  /**
   * Takes a farm object as an input and deletes the given farm
   * object from the database
   * @param data A farm object
   */
  handleDelete(data) {
    axios.defaults.headers.common = { Authorization: `${this.getAuth()}` };
    let farmId = data.farm.farmId;
    axios
      .delete(`farms/${farmId}`)
      .then(() => {
        this.props.alert("success", "Farm successfully deleted!");
        window.location.reload();
      })
      .catch((err) => {
        console.error(err);
        this.props.alert(
          "error",
          "An error occurred when attempting to delete the Farm!"
        );
      });
  }

  /**
   * Takes a farm object as an input and opens a dialog page to
   * allow the user to update the attributes of the farm object
   * @param data A farm object
   */
  handleEditClick(data) {
    this.setState({
      // Farm states
      farmName: data.farm.farmName,
      farmId: data.farm.farmId,
      contacts: data.farm.contacts,
      farmTags: data.farm.farmTags,
      forklift: data.farm.forklift,
      loadingDock: data.farm.loadingDock,
      location: data.farm.location,
      locationId: data.farm.locationId,
      transportation: data.farm.transportation,
      // Page states
      buttonType: "Edit",
      open: true,
    });
    tableState.data = data.farm.contacts;
  }

  /**
   * Takes a farm object as an input and opens a popup with all the
   * information about the farm (currently not being used -> will be
   * updated to show augmented information)
   * @param data A farm object
   */
  handleViewOpen(data) {
    this.setState({
      // Farm states
      farmName: data.farm.farmName,
      contacts: data.farm.contacts,
      farmTags: data.farm.farmTags,
      forklift: data.farm.forklift,
      loadingDock: data.farm.loadingDock,
      location: data.farm.location,
      locationId: data.farm.locationId,
      transportation: data.farm.transportation,
      // Page states
      viewOpen: true,
    });
  }

  // string for which search, search can auto update onChange of the nameQuery state??

  // Updates the string that the produce array will be searched for.
  // This string value can contain any produce field (name, weight, internal
  // shipment numbers) and will still return
  // the appropriate filtered results.
  handleNameSearch = (event) => {
    const { value } = event.target;
    this.setState({ value });
    // reset page data upon clearing of search value ? dif situation here ?
    if (value === "") {
      //this.setState({ filteredData: this.state.data.slice() });
      return;
    }
    this.simpleSearch("name", event.target.value); // update fD
  };

  // handlesSelects only right now - expand for anyChange next?
  handleLocationSearch = (event) => {
    if (event.target.value === "") {
      //this.setState({ filteredData: this.state.data.slice() });
      // TODO: use data reset button instead?
      return;
    }

    const lq = event.target.value;

    this.setState({
      locationQuery: lq,
      //filteredData: this.state.data.slice(),
    });

    this.simpleSearch("location", event.target.value);
  };
  // TODO: see if can isolate only the mos trecent addition - let it go
  /** Used to update tagQueries for searching the page */
  handleTagFilter = (event, values) => {
    // console.log("htf called: ", event.target.value)
    console.log("HTF VALUES", values);
    // console.log("htf called: ", event.target.values);
    // console.log("htf called. et: ", event.target);
    // console.log("htf called. e: ", event);
    if (values === null || values === []) {
      return;
    }
    var { tagsQuery } = this.state;
    // tagsQuery.push.apply(tagsQuery, values);

    //tagsQuery.push.apply([], values);
    // needed for state change to register? or perhaps not?
    if (values.length < tagsQuery.length) {
      this.resetCards();
    } else {
      tagsQuery.push.apply(tagsQuery, values);
    }

    // to get state change to register, need to ?
    // this.setState({
    //   // Search state
    //   tagsQuery: [...values],
    // });
    console.log("updated tq why? ", this.state.tagsQuery);
    // update after cards have been reset!
    this.state.tagsQuery.map((tag) => this.simpleSearch("tag", tag));
  };
  //handleTagFilter = (event) =>
  // handleTagFilter = (event) => {
  //   console.log("ht event", event);
  //   console.log("ht etv", event.target.value);
  //   if (event.target.value === [] || event.target.value === "") {
  //     //this.setState({ filteredData: this.state.data.slice() });
  //     // TODO: use data reset button instead?
  //     return;
  //   }

  //   //const lq = event.target.value;
  //   // add to the existing array or what oops - is this too direct modify?
  //   // copy the array, edit it, then setState to a copy of that array next???
  //   // return to what push.apply returns to us???
  //   // when / how to update tQuery - inside here or after here???
  //   // we might already have the whole array RIPPP :(
  //   // did i learn this for nothing :/
  //   // ok try it out - maybe dont code at 4am again
  //   var { tagQuery } = this.state;
  //   tagQuery.push.apply(tagQuery, event.target.value);
  //   tagQuery.map((tag) => this.simpleSearch("tag", tag)); // only want to ss the next one that got added
  //   // aka 1 by 1 search things ideally
  //   // tracking tQ not needed in btwn things then?
  // };
  // Search specified field for string query
  // Render updated data into the cards - reload if user wants to re name - search after adding extra search details in
  simpleSearch = (field, query) => {
    console.log("query here", query);
    var multiFilteredData = "";
    if (field === "name") {
      multiFilteredData = this.state.filteredData.filter((farm) =>
        farm.farmName.toLowerCase().includes(query.toLowerCase())
      );
    }

    // turn into a case switch? more scalable way to do this?
    if (field === "location") {
      multiFilteredData = this.state.filteredData.filter((farm) =>
        farm.location.toLowerCase().includes(query.toLowerCase())
      );
    }
    // check if farm.farmTags has the tag as an element -
    // only complete tags will be entered, since onSelect only,
    // no searching from onChange - no need to lowercase any
    if (field === "tag") {
      multiFilteredData = this.state.filteredData.filter((farm) =>
        farm.farmTags.includes(query)
      );
    }
    console.log("mfd here: ", multiFilteredData);
    this.setState({ filteredData: multiFilteredData });
    //this.handleResultsRender(multiFilteredData);
    this.populateAllFarmTags();
    // update farm tags with newly filtered data
  };

  // Iterate through selectedTags and call simpleSearch on each

  // Returns the accordion menu that houses all search and filtering options
  filteringAccordion = () => {
    const { classes } = this.props;
    const { nameQuery, locationQuery, filteredData } = this.state;
    // For filtering by name and location
    const { data } = this.state;
    // For filtering by distances from location
    return (
      <div>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography className={classes.heading}>Search by Name</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Button
              //onClick={() => this.resetCards}
              onClick={this.resetCards}
              variant="contained"
              color="primary"
            >
              <ClearIcon />
              All Queries
            </Button>
            <Autocomplete
              id="produce-name-search"
              options={filteredData.map((produce) => produce.farmName)}
              value={nameQuery}
              onSelect={this.handleNameSearch} // Receive the name from data element for value
              fullWidth={true}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Farm Names"
                  variant="outlined"
                  onChange={this.handleNameSearch}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography className={classes.heading}>
              Search by Location
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Autocomplete
              id="produce-name-search2"
              options={filteredData.map((produce) => produce.location)}
              value={locationQuery}
              onSelect={this.handleLocationSearch} // Receive the name from data element for value
              fullWidth={true}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Farm Locations"
                  variant="outlined"
                  onChange={this.handleLocationSearch}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2a-content"
            id="panel2a-header"
          >
            <Typography className={classes.heading}>
              Find Farms within Custom Distance of a Location | Driving Hours or
              Miles
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {/* Skeleton to add location search */}
            <Typography>Select tags to filter by:</Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2a-content"
            id="panel2a-header"
          >
            <Typography className={classes.heading}>Filter by Tags</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {/** Adjust spacing here **/}
            {this.tagsAutocompleteSearch()}
          </AccordionDetails>
        </Accordion>
      </div>
    );
  };

  // Q for reviewers: should i separate this function into two?
  // Returns tag autocomplete search - used in filteringAccording and
  // add or edit a farm form
  // div and container spacing around respectively - or assign spacing inline with boolean check
  tagsAutocompleteSearch = () => {
    const { classes } = this.props;
    const { filteredData, viewOpen, allFarmTags, tagsQuery } = this.state;
    console.log("FD HERE", filteredData);
    return (
      <div>
        <Autocomplete
          multiple
          id="farmTags"
          //onChange={viewOpen? this.onTagsChange : this.handleTagsSe}
          // is null safe here
          onChange={viewOpen ? this.onTagsChange : this.handleTagFilter}
          // doesn't do anything onSelect={viewOpen ? this.onTagsChange : this.handleTagFilter}
          options={allFarmTags}
          //defaultValue={viewOpen ? this.state.farmTags : allFarmTags}
          //value={tagsQuery} // update from here instead? but why??
          // old dval? to get it to show viusually yes
          fullWidth={viewOpen ? false : true}
          // viewOpen ? this.state.farmTags :
          freeSolo={viewOpen ? true : false}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip label={option} {...getTagProps({ index })} />
            ))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              label="Farm Tags"
              placeholder="tags..."
              InputProps={
                viewOpen
                  ? null
                  : {
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                          {params.InputProps.startAdornment}
                        </>
                      ),
                    }
              }
            />
          )}
        />
      </div>
    );
  };

  // Upon clearing of search queries, or clicking reset button
  // Reset filteredData to the original page data
  resetCards = () => {
    // help why doesn't it update... but push apply does?
    console.log("current fd", this.state.filteredData);
    console.log("current d", this.state.data);
    //var copyData = this.state.data.map((item) => item);
    const copyData = this.state.data.slice();
    console.log("cd pls :( ", copyData);
    this.setState(
      {
        filteredData: copyData,
      },
      this.handleResultsRender
    );
    // this.setState((prevState) => ({
    //   filteredData: [...prevState.data],
    // }));
    console.log("updated fd", this.state.filteredData);
    // this.state.filteredData.push.apply([], this.state.data);
    // var newData = [...this.state.data];
    // console.log("current nd", this.state.data);
    // this.setState({
    //   filteredData: newData,
    // });
    // this.setState((state) => {
    //   const filteredData = state.data.map((item) => item);

    //   return { filteredData };
    // });
  };

  // Handles the rendering of filtered produce results into React cards
  handleResultsRender = () => {
    const { classes } = this.props;
    const { filteredData } = this.state;
    console.log("FD HERE", filteredData);

    return (
      <div>
        <Grid container spacing={2} alignItem="center">
          {filteredData.map((farm) => (
            <Grid item xs={12} key={farm.farmId}>
              <Card className={classes.root} variant="outlined">
                <CardContent>
                  <Typography variant="h5" component="h2">
                    {farm.farmName}
                  </Typography>
                  {farm.farmTags.map((tag) => (
                    <Chip className={classes.chip} label={tag} size="small" />
                  ))}
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
                        Location of Farm: {`${farm.location.substring(0, 30)}`}
                        <br />
                        {`${farm.location.substring(30, 78)}`}
                      </Typography>
                    </Box>
                    <Box p={3}>
                      <Typography className={classes.pos} color="textSecondary">
                        Point of Contact:
                      </Typography>
                      <Typography variant="body2" component="p">
                        Name: {farm.contactName}
                        <br />
                        Phone: {farm.contactPhone}
                        <br />
                        Email: {farm.contactEmail}
                      </Typography>
                    </Box>
                    <Box p={3}>
                      <Typography className={classes.pos} color="textSecondary">
                        Logistics:
                      </Typography>
                      <Typography variant="body2" component="p">
                        Have Transportation Means:{" "}
                        {farm.transportation ? "yes" : "no"}
                        <br />
                        Loading Dock: {farm.loadingDock ? "yes" : "no"}
                        <br />
                        Forklift: {farm.forklift ? "yes" : "no"}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
                <CardActions>
                  {/* <Button size="small" color="primary" onClick={() => this.handleViewOpen({ farm })}>
                                                {" "}
                                                View{" "}
                                            </Button> */}
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => this.handleEditClick({ farm })}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => this.handleDelete({ farm })}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </div>
    );
  };

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
        // Farm states
        farmName: "",
        farmId: "",
        farmTags: [],
        contacts: [],
        forklift: false,
        loadingDock: false,
        location: "",
        locationId: "",
        transportation: false,
        // Page states
        open: true,
      });
      tableState.data = [];
    };

    /**
     * Either updates or submits a new farm object to the data base
     * @param event The event being handled
     */
    const handleSubmit = (event) => {
      authMiddleWare(this.props.history);
      event.preventDefault();
      const newFarm = {
        // farm states
        farmName: this.state.farmName,
        contacts: this.state.contacts,
        farmTags: this.state.farmTags,
        forklift: this.state.forklift,
        loadingDock: this.state.loadingDock,
        location: this.state.location,
        locationId: this.state.locationId,
        transportation: this.state.transportation,
      };
      let options = {};
      if (this.state.buttonType === "Edit") {
        options = {
          url: `/farms/${this.state.farmId}`,
          method: "put",
          data: newFarm,
        };
      } else {
        options = {
          url: "/farms",
          method: "post",
          data: newFarm,
        };
      }
      const authToken = localStorage.getItem("AuthToken");
      axios.defaults.headers.common = { Authorization: `${authToken}` };
      axios(options)
        .then(() => {
          this.setState({ open: false });
          const alert =
            this.state.buttonType === "Edit" ? " edited!" : " submitted!";
          this.props.alert("success", "Farm has been successfully" + alert);
          window.location.reload();
        })
        .catch((error) => {
          const alert = this.state.buttonType === "Edit" ? " edit" : " submit";
          this.props.alert(
            "error",
            "An error has occured when attempting to " + alert + " the produce!"
          );
          this.setState({ open: true, errors: error.response.data });
          console.error(error);
        });
    };

    const handleViewClose = () => {
      // Page state
      this.setState({ viewOpen: false });
    };

    const handleDialogClose = (event) => {
      // Page state
      this.setState({ open: false });
    };

    if (this.state.uiLoading === true) {
      return (
        <main className={classes.content}>
          {this.state.uiLoading && <CardSkeletons classes={classes} />}
        </main>
      );
    } else {
      return (
        <main className={classes.content}>
          <div className={classes.toolbar} />

          <Fab
            color="primary"
            className={classes.floatingButton}
            aria-label="Add Farm"
            onClick={handleAddClick}
          >
            <AddIcon />
          </Fab>
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
                    ? "Edit Farm"
                    : "Create a new Farm"}
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
                <Grid container spacing={4} allignItems="center">
                  <Grid item xs={6}>
                    <TextField
                      variant="outlined"
                      required
                      fullWidth
                      id="farmName"
                      label="Farm Name"
                      name="farmName"
                      type="text"
                      autoComplete="farmName"
                      helperText={errors.farmName}
                      value={this.state.farmName}
                      error={errors.farmName ? true : false}
                      onChange={this.handleChange}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Address
                      handleLocation={this.handleLocation}
                      location={this.state.location}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <FormControl variant="outlined" fullWidth>
                      <InputLabel htmlFor="outlined-transportation">
                        Loading Dock Present
                      </InputLabel>
                      <Select
                        value={this.state.loadingDock}
                        onChange={this.handleChange}
                        label="Loading Dock Present"
                        inputProps={{
                          name: "loadingDock",
                          id: "outlined-loadingDock",
                        }}
                      >
                        <MenuItem value={true}>Yes</MenuItem>
                        <MenuItem value={false}>No</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={4}>
                    <FormControl variant="outlined" fullWidth>
                      <InputLabel htmlFor="outlined-transportation">
                        Forklift Present
                      </InputLabel>
                      <Select
                        value={this.state.forklift}
                        onChange={this.handleChange}
                        label="Forklift Present"
                        inputProps={{
                          name: "forklift",
                          id: "outlined-forklift",
                        }}
                      >
                        <MenuItem value={true}>Yes</MenuItem>
                        <MenuItem value={false}>No</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={4}>
                    <FormControl variant="outlined" fullWidth>
                      <InputLabel htmlFor="outlined-transportation">
                        Transportation Present
                      </InputLabel>
                      <Select
                        value={this.state.transportation}
                        onChange={this.handleChange}
                        label="Transportation Present"
                        inputProps={{
                          name: "transportation",
                          id: "outlined-transportation",
                        }}
                      >
                        <MenuItem value={true}>Yes</MenuItem>
                        <MenuItem value={false}>No</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    {this.tagsAutocompleteSearch()}
                  </Grid>
                </Grid>
                <div className={classes.tablePadding}>
                  <CustomTable
                    title="Farms Contacts"
                    tableState={tableState}
                    data={this.state.contacts}
                    changeContacts={this.changeContacts}
                  />
                </div>
              </form>
            </Container>
          </Dialog>
          <Container maxWidth="lg">
            <Grid container spacing={2} alignItem="center">
              <Grid item xs={12}>
                {this.filteringAccordion()}
              </Grid>
            </Grid>
            {this.handleResultsRender()}
          </Container>

          <Dialog
            onClose={handleViewClose}
            aria-labelledby="customized-dialog-title"
            open={viewOpen}
            fullWidth
            classes={{ paperFullWidth: classes.dialogStyle }}
          >
            <DialogTitle id="customized-dialog-title" onClose={handleViewClose}>
              {this.state.farmName}
            </DialogTitle>
            <DialogContent dividers>
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
                    Location of Farm: {this.state.location}
                  </Typography>
                </Box>
                <Box p={3}>
                  <Typography className={classes.pos} color="textSecondary">
                    Point of Contact:
                  </Typography>
                  {/* <Typography variant="body2" component="p">
                    Name: {this.state.contacts[0]["contactName"]}
                    <br />
                    Phone: {this.state.contacts[0]["contactPhone"]}
                    <br />
                    Email: {this.state.contacts[0]["contactEmail"]}
                  </Typography> */}
                </Box>
                <Box p={3}>
                  <Typography className={classes.pos} color="textSecondary">
                    Logistics:
                  </Typography>
                  <Typography variant="body2" component="p">
                    Have Transportation Means:
                    {this.state.transportation ? "yes" : "no"}
                    <br />
                    Loading Dock: {this.state.loadingDock ? "yes" : "no"}
                    <br />
                    Forklift: {this.state.forklift ? "yes" : "no"}
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

export default withStyles(styles)(Farms);
