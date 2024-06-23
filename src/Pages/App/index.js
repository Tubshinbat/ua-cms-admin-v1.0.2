import { useEffect } from "react";
import * as React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { useCookies, CookiesProvider } from "react-cookie";
import { connect } from "react-redux";
import { ToastContainer } from "react-toastify";
import { ConfigProvider } from "antd";
import Cookies from "js-cookie";

//Styles
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import "antd/dist/antd.css";

// Import components
import Header from "../../Components/Header";
import Side from "../../Components/Side";

// Import page

//MENU
import Menus from "../Menus";
import FooterMenu from "../Menus/footer";
// TOPLINKS
import TopLinks from "../Menus/toplinks";
import ToplinksAdd from "../Menus/toplinks/Add";
import ToplinksEdit from "../Menus/toplinks/Edit";
// FASTLINKS
import FastLinks from "../Menus/fastlinks";
import FastLinksAdd from "../Menus/fastlinks/Add";
import FastLinksEdit from "../Menus/fastlinks/Edit";
//NEWS
import News from "../News";
import NewsAdd from "../News/Add";
import NewsEdit from "../News/Edit";
import NewsCategories from "../News/News_categories";
// Media
import Media from "../Media";
import MediaAdd from "../Media/Add";
import MediaEdit from "../Media/Edit";
import MediaCategories from "../Media/Media_categories";

// Page
import PageAdd from "../Page/Add";
import PageEdit from "../Page/Edit";
import Page from "../Page";
//Partner
import Partner from "../Partner";
import PartnerAdd from "../Partner/Add";
import PartnerEdit from "../Partner/Edit";
// Employees
import Employee from "../Employees";
import EmployeeAdd from "../Employees/Add";
import EmployeeEdit from "../Employees/Edit";
import EmployeePostion from "../Employees/positions";
//Books
import Book from "../Book";
import BookAdd from "../Book/Add";
import BookEdit from "../Book/Edit";
// Position
import Position from "../Position";
//User
import User from "../Users";
import UserAdd from "../Users/Add";
import UserEdit from "../Users/Edit";
// Contact
import Contact from "../Contact";
// WEBSETTINGS
import WebSettings from "../WebSettings";
import Socials from "../WebSettings/socials";
import Adsies from "../WebSettings/ads";
import AdsiesAdd from "../WebSettings/ads/Add";
import AdsiesEdit from "../WebSettings/ads/Edit";
import Banner from "../WebSettings/banner";
import BannerAdd from "../WebSettings/banner/Add";
import BannerEdit from "../WebSettings/banner/Edit";
import Logout from "../Logout";
import LoginPage from "../Login";
import Dashboard from "../Dashboard";

// Actions
import { tokenCheck } from "../../redux/actions/tokenActions";

function App(props) {
  const validateMessages = {
    required: "Заавал бөглөнө үү!",
  };

  const [cookies] = useCookies(["uatoken", "language"]);

  useEffect(() => {
    if (cookies.uatoken) {
      const token = cookies.uatoken;
      props.checkToken(token);
    }
  }, cookies);

  useEffect(() => {
    if (props.tokenError) {
      Cookies.remove("uatoken");
      document.location.href = "/login";
    }
  }, props.tokenError);

  return (
    <>
      {cookies.uatoken ? (
        <ConfigProvider form={{ validateMessages }}>
          <CookiesProvider>
            <Header />
            <Side />
            <Switch>
              <Route path="/" exact component={Dashboard} />
              //Page
              <Route path={"/pages/edit/:id"} component={PageEdit} />
              <Route path="/pages/add" component={PageAdd} />
              <Route path="/pages" exact component={Page} />
              // Partner
              <Route path={"/partners/edit/:id"} component={PartnerEdit} />
              <Route path="/partners/add" component={PartnerAdd} />
              <Route path="/partners" exact component={Partner} />
              //users
              <Route path="/users/add" exact component={UserAdd} />
              <Route path="/users/edit/:id" exact component={UserEdit} />
              <Route path="/users" exact component={User} />
              //NEWS
              <Route path={"/news/edit/:id"} component={NewsEdit} />
              <Route path="/news/categories" exact component={NewsCategories} />
              <Route path="/news/add" component={NewsAdd} />
              <Route path="/news" exact component={News} />
              //Media
              <Route path={`/media/edit/:id`} component={MediaEdit} />
              <Route
                path="/media/categories"
                exact
                component={MediaCategories}
              />
              <Route path="/media/add" component={MediaAdd} />
              <Route path="/media" exact component={Media} />
              // Employee
              <Route path="/employees/edit/:id" component={EmployeeEdit} />
              <Route path="/employees/add" component={EmployeeAdd} />
              <Route path="/employees" exact component={Employee} />
              <Route path="/employee-position" component={EmployeePostion} />
              <Route path="/position" exact component={Position} />
              //Book
              <Route path="/books/edit/:id" component={BookEdit} />
              <Route path="/books/add" component={BookAdd} />
              <Route path="/books" exact component={Book} />
              // toplinks
              <Route path="/top-links/edit/:id" component={ToplinksEdit} />
              <Route path="/top-links/add" component={ToplinksAdd} />
              <Route path="/top-links" exact component={TopLinks} />
              // fastlinks
              <Route path="/fast-links/edit/:id" component={FastLinksEdit} />
              <Route path="/fast-links/add" component={FastLinksAdd} />
              <Route path="/fast-links" exact component={FastLinks} />
              //Contact
              <Route path="/contact" component={Contact} />
              // Websettings
              <Route
                path="/web_settings/banners/add"
                exact
                component={BannerAdd}
              />
              <Route
                path="/web_settings/banners/edit/:id"
                exact
                component={BannerEdit}
              />
              <Route path="/web_settings/banners" exact component={Banner} />
              <Route path="/menus" exact component={Menus} />
              <Route path="/menus/footer" exact component={FooterMenu} />
              <Route path="/web_settings/socials" exact component={Socials} />
              <Route path="/web_settings/ads" exact component={Adsies} />
              <Route path="/web_settings/ads/add" exact component={AdsiesAdd} />
              <Route
                path="/web_settings/ads/edit/:id"
                exact
                component={AdsiesEdit}
              />
              <Route path="/web_settings" exact component={WebSettings} />
              <Route path="/logout" component={Logout} />
              <Redirect to="/" />
            </Switch>
          </CookiesProvider>
        </ConfigProvider>
      ) : (
        <Switch>
          <Route path="/" exact component={LoginPage} />
          <Route path="/login" component={LoginPage} />
          <Redirect to="/login" />
        </Switch>
      )}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

const mapStateToProps = (state) => {
  return {
    tokenError: state.tokenReducer.error,
  };
};

const mapDispatchToProp = (dispatch) => {
  return {
    checkToken: (token) => dispatch(tokenCheck(token)),
  };
};

export default connect(mapStateToProps, mapDispatchToProp)(App);
