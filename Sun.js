/* 
 * Copyright (c) 2012, Chris Acky 
 * Sundial https://github.com/Kalyse/Sundial
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of the <organization> nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/*  Credit and References */
// http://lexikon.astronomie.info/zeitgleichung/   EOT 
// http://articles.adsabs.harvard.edu/cgi-bin/nph-iarticle_query?bibcode=1989MNRAS.238.1529H&db_key=AST&page_ind=2&plate_select=NO&data_type=GIF&type=SCREEN_GIF&classic=YES
// http://code.google.com/p/eesim/source/browse/trunk/EnergySim/src/sim/_environment.py?spec=svn6&r=6
// http://mathforum.org/library/drmath/view/56478.html 
// http://www.jgiesen.de/elevaz/basics/meeus.htm
// http://www.ehow.com/how_8495097_calculate-sunrise-latitude.html
// http://www.jgiesen.de/javascript/Beispiele/TN_Applet/DayNight125d.java
// http://astro.unl.edu/classaction/animations/coordsmotion/daylighthoursexplorer.html
// http://www.neoprogrammics.com/nutations/Nutation_In_Longitude_And_RA.php
(function (factory) {
    if (typeof define === 'function' && define.amd ) {
        // AMD. Register as module
        if(typeof dojo === 'object') {
            define(["dojo/_base/declare"], function(declare){
                return declare( "my.calc.Sun", null, factory());
            });
        } else {
            define( 'Sundial', null, factory());
        }
    } else {
        Sun = new factory();
    }
}(function () {   
    return {
        date : new Date(),  
        getDate : function(){
          return this.date;  
        },
        setDate : function(d){
          this.date = d;
          return this;
        },
        getJulianDays: function(){
            this._julianDays = Math.floor(( this.date / 86400000) - ( this.date.getTimezoneOffset() / 1440) + 2440587.5);
            return this._julianDays;
        },
        // Calculate the Equation of Time
        // The equation of time is the difference between apparent solar time and mean solar time. 
        // At any given instant, this difference will be the same for every observer on Earth.
        getEquationOfTime : function (){		
            var K = Math.PI/180.0;
            var T = (this.getJulianDays() - 2451545.0) / 36525.0;	
            var eps = this._getObliquity(T); // Calculate the Obliquity (axial tilt of earth)
            var RA = this._getRightAscension(T);
            var LS = this._getSunsMeanLongitude(T);
            var deltaPsi = this._getDeltaPSI(T);					
            var E = LS - 0.0057183 - RA + deltaPsi*Math.cos(K*eps);		
            if (E>5) {
                E = E - 360.0;
            }
            E = E*4; // deg. to min		
            E = Math.round(1000*E)/1000;								
            return E;		
        },
        getTotalDaylightHoursInYear : function(lat){
            // We can just use the current Date Object, and incrementally
            // Add 1 Day 365 times... 
            var totalDaylightHours = 0 ;
            for (var d = new Date(this.date.getFullYear(), 0, 1); d <= new Date(this.date.getFullYear(), 11, 30); d.setDate(d.getDate() + 1)) {
                this.date = d;
                // console.log( this.getDaylightHours(lat) );
                totalDaylightHours += this.getDaylightHours(lat);
            }
            return totalDaylightHours;  
        },
        getDaylightHours : function (lat) {
            var K = Math.PI/180.0;
            var C, Nenner, C2, dlh;
            var T = (this.getJulianDays() - 2451545.0) / 36525.0;	
            this._getRightAscension(T); // Need to get the Suns Declination
                
            Nenner = Math.cos(K*lat)*Math.cos(K*this._sunDeclination);
            C = -Math.sin(K*this._sunDeclination)*Math.sin(K*lat)/Nenner; 
            C2=C*C;
            // console.log( T, C2, C, Nenner, lat, K,  Math.cos(K*lat) );
            if ((C>-1) && (C<1)) {
                dlh=90.0 - Math.atan(C / Math.sqrt(1 - C2)) / K;
                dlh=2.0*dlh/15.0;
                dlh=Math.round(dlh*100)/100; 
            }
            if (C>1) {
                dlh=0.0;
            }
            if (C<-1) {
                dlh=24.0;
            }
            return dlh;
        },
        _getRightAscension : function(T) {	
            var K = Math.PI/180.0;				
            var L, M, C, lambda, RA, eps, delta, theta;						
            L = this._getSunsMeanLongitude(T); // Calculate the mean longitude of the Sun		
            M = 357.52910 + 35999.05030*T - 0.0001559*T*T - 0.00000048*T*T*T; // Mean anomoly of the Sun
            M = M % 360;		
            if (M<0) {
                M = M + 360;
            }		
            C = (1.914600 - 0.004817*T - 0.000014*T*T)*Math.sin(K*M);
            C = C + (0.019993 - 0.000101*T)*Math.sin(K*2*M);
            C = C + 0.000290*Math.sin(K*3*M);		
            theta = L + C; // get true longitude of the Sun						
            eps = this._getObliquity(T);				
            eps = eps + 0.00256*Math.cos(K*(125.04 - 1934.136*T));		
            lambda = theta - 0.00569 - 0.00478*Math.sin(K*(125.04 - 1934.136*T)); // get apparent longitude of the Sun
            RA = Math.atan2(Math.cos(K*eps)*Math.sin(K*lambda), Math.cos(K*lambda));				
            RA = RA/K;
            if (RA<0) {
                RA = RA + 360.0;
            }			
            delta = Math.asin(Math.sin(K*eps)*Math.sin(K*lambda));
            delta = delta/K;		
            this._sunDeclination = delta;				
            return RA;		
        },
        // Calculate the Mean Longitude of the Sun
        _getSunsMeanLongitude : function(T){
            var L = 280.46645 + 36000.76983*T + 0.0003032*T*T;	
            L = L % 360;		
            if (L<0) {
                L = L + 360;
            }
            return L;			
        },
        // Nutation in ecliptical longitude expressed in degrees.
        _getDeltaPSI : function(T){
            var K = Math.PI/180.0;
            var deltaPsi, omega, LS, LM;			
            LS = this._getSunsMeanLongitude(T);	
            LM = 218.3165 + 481267.8813*T;		
            LM = LM % 360;	
            if (LM<0) {
                LM = LM + 360;
            }	
            // Longitude of ascending node of lunar orbit on the ecliptic as measured from the mean equinox of date.
            omega = 125.04452 - 1934.136261*T + 0.0020708*T*T + T*T*T/450000;
            deltaPsi = -17.2*Math.sin(K*omega) - 1.32*Math.sin(K*2*LS) - 0.23*Math.sin(K*2*LM) + 0.21*Math.sin(K*2*omega);
            deltaPsi = deltaPsi/3600.0;		
            return deltaPsi;	
        },
        // T = Time Factor Time factor in Julian centuries reckoned from J2000.0, corresponding to JD
        // Calculate Earths Obliquity Nutation
        _getObliquity : function (T) {
            var K = Math.PI/180.0;
            var LS = this._getSunsMeanLongitude(T);
            var LM = 218.3165 + 481267.8813*T;	
            var eps0 =  23.0 + 26.0/60.0 + 21.448/3600.0 - (46.8150*T + 0.00059*T*T - 0.001813*T*T*T)/3600;
            var omega = 125.04452 - 1934.136261*T + 0.0020708*T*T + T*T*T/450000;		
            var deltaEps = (9.20*Math.cos(K*omega) + 0.57*Math.cos(K*2*LS) + 0.10*Math.cos(K*2*LM) - 0.09*Math.cos(K*2*omega))/3600;
            return eps0 + deltaEps;	
        }
    };
}));