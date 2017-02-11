// @author Rob W <http://stackoverflow.com/users/938089/rob-w>
// Demo: var serialized_html = DOMtoString(document);

function getSemesterFirstDay() {
  // TODO dynamically get this using web scraping from https://www.provost.umd.edu/calendar/16.cfm
  return new Date ("January 25, 2017");
}

function getSemesterLastDay() {
  // TODO dynamically get this using web scraping from https://www.provost.umd.edu/calendar/16.cfm
  return new Date ("May 11, 2017");
}

//trim leading and trailing white spaces
function trim (str) {
    str = str.replace(/^\s+/, '');
    for (var i = str.length - 1; i >= 0; i--) {
        if (/\S/.test(str.charAt(i))) {
            str = str.substring(0, i + 1);
            break;
        }
    }
    return str;
}

function parseMeetingLocationBuildRoom (str) {
  var start = str.indexOf("Location");
  str = str.slice(start);
  return str;
}

function DOMtoString(document_root) {
    var html = '';
		var entireCourseContainer = document_root.getElementsByClassName("listViewWrapper");
    //console.log(entireCourseContainer[0].getElementsByClassName("section-details-link")[0].innerText); 
    var courseInfoContainer = document_root.getElementsByClassName("list-view-course-info-div");
    //console.log(courseInfoContainer[0].innerText); 
    var meetingInfoContainer = document_root.getElementsByClassName("listViewMeetingInformation");
		//courseEventInfo = new Array();
    if (entireCourseContainer.length == 0 && courseInfoContainer.length == 0) {
        html = "Please navigate to the [Drop/Add] Register for Classes page, and select your term. Click on schedule details, and boom!";
        validPage = false;
    } else {
        validPage = true;
    }

    for(i = 0 ; i < entireCourseContainer.length; i++) {
    //i.e. Data Structures and Algorithms
    var classTitle = trim(entireCourseContainer[i].getElementsByClassName("section-details-link")[0].innerText);
    console.log(classTitle);
    //i.e. Computer Science 3114 Section 0
    var sectionDetails = trim(entireCourseContainer[i].getElementsByClassName("list-view-subj-course-section")[0].innerText);
    console.log(sectionDetails);

	  //Separated by commas ie: Monday, Wednesday
	  var meetingDays = trim(meetingInfoContainer[i].getElementsByClassName("ui-pillbox-summary screen-reader")[0].innerText);
	  console.log(meetingDays);

    //span[2] in listViewMeetingInformation = meeting times i.e. 02:30 PM - 03:45 PM
    var meetingTimes = trim(meetingInfoContainer[i].getElementsByTagName("span")[2].innerText);
    console.log(meetingTimes);

    //must parse this to find location, building, and room (no tag elements, lies within the entire wrapper)
    var locBuildRoom = trim(parseMeetingLocationBuildRoom(meetingInfoContainer[i].innerText));

    var locationIndex = locBuildRoom.indexOf("Location");
    var buildingIndex = locBuildRoom.indexOf("Building");
    var roomIndex = locBuildRoom.indexOf("Room");

    var locationStr = locBuildRoom.slice(locationIndex, buildingIndex);
    var location = trim(locationStr.slice(locationStr.indexOf(":") + 1));
    console.log(location);
    var buildingStr = locBuildRoom.slice(buildingIndex, roomIndex);
    var building = trim(buildingStr.slice(buildingStr.indexOf(":") + 1));
    console.log(building);
    var roomStr = locBuildRoom.slice(roomIndex);
    var room = trim(roomStr.slice(roomStr.indexOf(":") + 1));
    console.log(room);

	  
      // append to output (html) with "END" as separator
      var courseInfo = ccontainers[i].innerText.substring(1);
      html += courseInfo + "END";

      // Parse each course
      courseLines = courseInfo.split("\n")
      var classTypes = new Array();
      var timeLines = new Array();
      var roomLocations = new Array();
      for (j = 0; j < courseLines.length; j++) {
        var line = courseLines[j];

        if (j == 0) {  // Course Title
          var firstLine = line.split(" ");
          courseTitle = firstLine[0] + " " + firstLine[1];
          sectionCode = firstLine[2].substring(1,firstLine[2].length-1);
        } else if (line == "Lec" || line == "Dis" || line == "Lab") {
          if (courseLines[j+1] == "TBA") {  /* if time is TBA */
            // do nothing.
          } else {  // other info
            classTypes.push(courseLines[j]);
            timeLines.push(courseLines[j+1]);
            roomLocations.push(courseLines[j+2]);
          }
        } else if (line == "Final") { // end here; we don't want the final because generally not available yet
          break;
        }
      }

      // reformat data into usable variables
      for (j = 0; j < timeLines.length; j++) {
        // set starting variables
        classType = classTypes[j];
        timeLine = timeLines[j];
        roomLocation = roomLocations[j];

        // parse class time
        // M/T/W/Th/F (each optional), ##:##(a/p)m - ##:##(a/p)m
        // W 11:00am - 12:15pm
        timeLineInfo = timeLine.split(" ");
        daysStr = timeLineInfo[0];
        startTime = timeLineInfo[1];
        endTime = timeLineInfo[3];

        // get semester start dates
        semFirstDate = getSemesterFirstDay();
        semFirstDay = semFirstDate.getDay();
        //semEndDay = // TODO Need or don't need? Look at GCal API repeat requirements

        // separate out timecodes and parse into integers
        startHour = parseInt(startTime.match(/(\d+)/g)[0]);
        startMin = parseInt(startTime.match(/(\d+)/g)[1]);
        startPmAm = startTime.substr(-2);
        endHour = parseInt(endTime.match(/(\d+)/g)[0]);
        endMin = parseInt(endTime.match(/(\d+)/g)[1]);
        endPmAm = endTime.substr(-2);

        // regex to separate each day of the week
        daysArray = daysStr.match(/([A-Z][a-z]*)/g)
        classStartDay = 0;  // instantiate the day for comparison with semFirstDay
        for (k = 0; k < daysArray.length; k++) {
          switch(daysArray[k]) {
            case "M":
              classStartDay = 1;
              break;
            case "T":
              classStartDay = 2;
              break;
            case "W":
              classStartDay = 3;
              break;
            case "Th":
              classStartDay = 4;
              break;
            case "F":
              classStartDay = 5;
              break;
          }

          dayOffset = semFirstDay - classStartDay;

          // create duplicates for class start/end datetimes
          var classStartDate = new Date(semFirstDate.getTime());
          classStartDate.setHours(startHour);
          classStartDate.setMinutes(startMin);
          var classEndDate = new Date(semFirstDate.getTime());
          classEndDate.setHours(endHour);
          classEndDate.setMinutes(endMin);


          if (dayOffset == 0) {       // class day is same as semester start day
            // do nothing; the day is correct
          } else if (dayOffset > 0) { // class day is before semester start day (need to go to next week)
            classStartDate.setDate(classStartDate.getDate()+7-dayOffset);
            classEndDate.setDate(classEndDate.getDate()+7-dayOffset);
          } else {                    // class day is after semester start day (simply add onto the semFirstDay)
            classStartDate.setDate(classStartDate.getDate()+Math.abs(dayOffset));
            classEndDate.setDate(classEndDate.getDate()+Math.abs(dayOffset));
          }

          // store individual event's data in json format
          courseEventInfo.push({
            "courseTitle": courseTitle,
            "section": sectionCode,
            "classType": classType,
            "location": roomLocation,
            "startDate": classStartDate.toString(),
            "startPmAm": startPmAm,
            "endDate": classEndDate.toString(),
            "endPmAm": endPmAm
          });
        }
      }
    }

    // console.log(courseEventInfo);

    // TODO also return the json or array holding courses
    return [html, validPage, courseEventInfo,  getSemesterLastDay().toString()];
}

chrome.runtime.sendMessage({
    action: "getSource",
    source: DOMtoString(document)
});

/*4 letters, space, 3 numbers + letter (optional), space, (4 characters)
      each 3 lines is group:
      // Lec or Dis (the entire line)
      // M/T/W/Th/F (each optional), ##:##(a/p)m - ##:##(a/p)m
      // Location: capital letters, space, numbers OR "ONLINE"
      Final
      TBA/something else
      */

      /*BMGT 350 (BL06)
      Lec
      W 11:00am - 12:15pm
      VMH 1330
      Lec
      TBA
      ONLINE
      Final
      TBA*/

      /*BMGT 350 (BL06)
      Lec
      W 11:00am - 12:15pm
      VMH 1330
      Lec
      TBA
      ONLINE
      Final
      TBA

      CMSC 389K (0101)
      Lec
      F 3:00pm - 3:50pm
      CSI 1122
      Final
      TBA

      CMSC 420 (0101)
      Lec
      MW 2:00pm - 3:15pm
      CSI 2117
      Final
      TBA

      ECON 201 (0201)
      Lec
      TTh 3:30pm - 4:45pm
      TYD 0130
      Final
      TBA

      HEIP 241 (0101)
      Lec
      MW 5:00pm - 5:50pm
      LPA 1125
      Final
      TBA

      HONR 248J (0101)
      Lec
      TTh 11:00am - 12:15pm
      KNI 1105
      Final
      TBA
      */