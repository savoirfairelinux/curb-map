import * as React from "react";
import './index.css';
import { Button, Card, Descriptions, Icon, Layout, Radio, Select } from "antd";
import { formatMessage, setLocale, getLocale, FormattedMessage } from 'umi-plugin-locale';
import CookieConsent, { Cookies } from "react-cookie-consent";
import { Link } from 'umi';
import {isMobile} from 'react-device-detect';


export default class extends React.Component {

  constructor(props) {
    super(props);
  }

  state = {
    isLoading: false,
  }



  render() {
    return (
      <div style= {{ display: "flex", 
                flexDirection: "column", 
                alignContent: "center", 
                marginLeft: isMobile ? "1rem" : "10rem", 
                marginRight: isMobile ? "1rem" : "10rem",
                marginTop: isMobile ? "1rem" : "5rem",
                marginBottom: isMobile ? "1rem" : "5rem"
            }}>
        <Button size="small" type="primary" style={{ width: "12rem"}}><Link to="/index"><FormattedMessage id="return_to_map" /></Link></Button>
        <h1></h1>
        <p><FormattedMessage id="consent_p1" /></p>
        <p><FormattedMessage id="consent_p2" /></p>
        <p><FormattedMessage id="consent_p3" />{" "}<a href="https://tools.google.com/dlpage/gaoptout">https://tools.google.com/dlpage/gaoptout.</a></p>
        <p><FormattedMessage id="consent_p4" />{""}<a href="https://policies.google.com/privacy?hl=fr-CA.">https://policies.google.com/privacy?hl=fr-CA.</a></p>
        <p><FormattedMessage id="consent_p5" /></p>
        <p><FormattedMessage id="consent_p6" /></p>
        <p>La Fabrique des mobilités Québec</p>
        <p>200-7275 rue Saint-Urbain</p>
        <p>Montréal (Québec) H2R2Y5</p>
        <p>Canada</p>
        <p><a href="mailto:contact@fabmob.io">contact@fabmob.io</a></p>
        <p><FormattedMessage id="consent_p7" /></p>
        <p><FormattedMessage id="consent_p8" /></p>
        <p><FormattedMessage id="consent_p9" />{" "}<a href="https://laburbain.montreal.ca/sites/default/files/charte_donnees_numeriques_1_0.pdf">charte_donnees_numeriques_1_0.pdf (montreal.ca)</a></p>
        <p><FormattedMessage id="consent_p10" />{" "}<a href="https://wiki.lafabriquedesmobilites.fr/wiki/Carte_CurbLR_de_Montr%C3%A9al"><FormattedMessage id="consent_p11" /></a></p>
        <CookieConsent
          location="bottom"
          buttonText={<FormattedMessage id='i_consent' />}
          cookieName="cookieConsent"
          style={{ backgroundColor: "#000000", color: "#ffffff" }}
          buttonStyle={{ color: "#4e503b", fontSize: "13px" }}
          expires={150}
        >
          <FormattedMessage id='cookie_consent_text'/>{" "}
        </CookieConsent>
        <Card
          size="small"
          title=""
          bordered={true}
          style={{
            position: "fixed",
            right: "10px",
            top: "10px",
            height: "60px",
            overflow: "auto",
            backgroundColor: "transparent",
            border: "none",
            display: "flex", 
            cursor: "pointer" 
          }}
        >
        <Button type={getLocale() === 'en-US' ? "primary" : "default"} style={{marginRight: "0.1rem"}} onClick={(e) => {e.preventDefault(); setLocale('en-US')}}>EN</Button><Button type={getLocale() === 'fr-FR' ? "primary" : "default"} style={{marginLeft: "0.1rem"}} onClick={(e) => {e.preventDefault(); setLocale('fr-FR')}}>FR</Button>
        </Card>
      </div>
    )
  }
}