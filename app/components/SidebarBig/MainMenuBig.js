import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import List from '@material-ui/core/List';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ButtonBase from '@material-ui/core/ButtonBase';
import Icon from '@material-ui/core/Icon';
import { openMenuAction } from 'enl-redux/actions/uiActions';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import messages from 'enl-api/ui/menuMessages';
import MenuProfile from './MenuProfile';
import styles from './sidebarBig-jss';

const LinkBtn = React.forwardRef(function LinkBtn(props, ref) { // eslint-disable-line
  return <NavLink to={props.to} {...props} innerRef={ref} />; // eslint-disable-line
});

class MainMenuBig extends React.Component { // eslint-disable-line
  state = { selectedMenu: [], menuLoaded: true };

  handleLoadMenu(menu) {
    const { openDrawer, mobile } = this.props;
    this.setState({
      selectedMenu: menu,
      menuLoaded: false, // unload transtion menu
    });
    setTimeout(() => {
      this.setState({ menuLoaded: true }); // load transtion menu
    }, 100);
    // Unecessary in mobile, because toggle menu already handled
    if (!mobile) {
      openDrawer();
    }
  }

  handleLoadPage() {
    const { loadTransition, toggleDrawerOpen } = this.props;
    toggleDrawerOpen();
    loadTransition(false);
  }

  render() {
    const {
      classes,
      open,
      dataMenu,
      drawerPaper,
      userAttr,
      intl,
    } = this.props;
    const { selectedMenu, menuLoaded } = this.state;
    const currentMenu = dataMenu.filter(item => item.key === open.get(0));
    const activeMenu = (key, child) => {
      if (selectedMenu.length < 1) {
        if (open.indexOf(key) > -1) {
          return true;
        }
        return false;
      }
      if (child === selectedMenu) {
        return true;
      }
      return false;
    };
    const getMenus = menuArray => menuArray.map((item, index) => {
      if (item.key === 'menu_levels') {
        return false;
      }
      if (item.child) {
        return (
          <ButtonBase
            key={index.toString()}
            focusRipple
            className={
              classNames(
                classes.menuHead,
                activeMenu(item.key, item.child) ? classes.active : ''
              )
            }
            onClick={() => this.handleLoadMenu(item.child)}
          >
            <Icon className={classes.icon}>{item.icon}</Icon>
            <span className={classes.text}>
              {
                messages[item.key] !== undefined
                  ? <FormattedMessage {...messages[item.key]} />
                  : item.name
              }
            </span>
          </ButtonBase>
        );
      }
      return (
        <ButtonBase
          key={index.toString()}
          focusRipple
          className={classNames(classes.menuHead, open.indexOf(item.key) > -1 ? classes.active : '')}
          component={LinkBtn}
          to={item.link}
        >
          <Icon className={classes.icon}>{item.icon}</Icon>
          <span className={classes.text}>
            {
              messages[item.key] !== undefined
                ? <FormattedMessage {...messages[item.key]} />
                : item.name
            }
          </span>
        </ButtonBase>
      );
    });

    const getChildMenu = menuArray => menuArray.map((item, index) => {
      if (item.title) {
        return (
          <ListSubheader
            key={index.toString()}
            disableSticky
            className={classes.title}
          >
            {
              messages[item.key] !== undefined
                ? <FormattedMessage {...messages[item.key]} />
                : item.name
            }
          </ListSubheader>
        );
      }
      return (
        <ListItem
          key={index.toString()}
          button
          exact
          className={classes.item}
          activeClassName={classes.active}
          component={LinkBtn}
          to={item.link}
          onClick={() => this.handleLoadPage()}
        >
          <ListItemIcon>
            <Icon className={classes.icon}>{item.icon}</Icon>
          </ListItemIcon>
          <ListItemText
            className={classes.text}
            primary={
              messages[item.key] !== undefined
                ? intl.formatMessage(messages[item.key])
                : item.name
            }
          />
        </ListItem>
      );
    });

    const renderChildMenu = () => {
      if (selectedMenu.length < 1) {
        return (
          <List dense className={classes.fixedWrap}>
            {currentMenu.length > 0 ? getChildMenu(currentMenu[0].child) : ''}
          </List>
        );
      }
      return (
        <List
          dense
          className={
            classNames(
              classes.fixedWrap,
              classes.childMenuWrap,
              menuLoaded && classes.menuLoaded
            )
          }
        >
          {getChildMenu(selectedMenu)}
        </List>
      );
    };

    return (
      <aside className={classes.bigSidebar}>
        <nav className={classes.category}>
          <div className={classes.fixedWrap}>
            <MenuProfile userAttr={userAttr} />
            {getMenus(dataMenu)}
          </div>
        </nav>
        <nav className={classNames(classes.listMenu, !drawerPaper && classes.drawerPaperClose)}>
          {renderChildMenu()}
        </nav>
      </aside>
    );
  }
}

MainMenuBig.propTypes = {
  classes: PropTypes.object.isRequired,
  userAttr: PropTypes.object.isRequired,
  open: PropTypes.object.isRequired,
  dataMenu: PropTypes.array.isRequired,
  openDrawer: PropTypes.func.isRequired,
  loadTransition: PropTypes.func.isRequired,
  drawerPaper: PropTypes.bool.isRequired,
  mobile: PropTypes.bool,
  toggleDrawerOpen: PropTypes.func,
  intl: intlShape.isRequired
};

MainMenuBig.defaultProps = {
  toggleDrawerOpen: () => {},
  mobile: false
};

const reducer = 'ui';

const mapStateToProps = state => ({
  open: state.getIn([reducer, 'subMenuOpen']),
  ...state
});

const mapDispatchToProps = dispatch => ({
  openDrawer: () => dispatch(openMenuAction)
});

const MainMenuBigMapped = connect(
  mapStateToProps,
  mapDispatchToProps,
)(MainMenuBig);

export default withStyles(styles)(injectIntl(MainMenuBigMapped));
