Sundial
=======

Calculating the Hours of Sunlight in a day based on the latitude of a location. 

Sundial, can be used with any AMD compatibile loader, Dojo, or as a standalone module loaded via standard script tags. 

Loading Via an AMD Loader
-------------------------
```
require(["Sundial"], function(Sun){
         var s = new Sun();       
         s.date = new Date(2012, 5, 21); // 2012 is a leap year
         // Takes one argument which is the latitude of the location
         s.getDaylightHours(50); // Returns 16.15 - Longest day of the year
         s.getTotalDaylightHoursInYear(50); // Returns 4404.769999999997 
         
         s.date = new Date(2013, 5, 21); // 2013 is not a leap year
         s.getTotalDaylightHoursInYear(50); // Returns 4396.819999999999 
    });
```

Sundial should be accurate to 0.0001 minutes and takes into account the [axial tilt][2] of the earth, and the [equation of time][3].
Because of this, if you are checking the hours of sunlight for consecutive years, you will notice that it fluctuates by up to ten minutes for non leap years, and several hours for leap years. 

 [2]: http://en.wikipedia.org/wiki/Axial_tilt
 [3]: http://en.wikipedia.org/wiki/Equation_of_time

Loading Via Normal Script Tags
------------------------------

```
  <script type="text/javascript" src="/path/to/Sun.js"></script>
  <script type="text/javascript">
     Sun.date =  new Date(2012, 5, 21);
     Sun.getDaylightHours( 50 ); // Returns 16.15
  </script>

```

