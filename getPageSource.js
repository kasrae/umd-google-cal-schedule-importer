// @author Rob W <http://stackoverflow.com/users/938089/rob-w>
// Demo: var serialized_html = DOMtoString(document);

function getSemesterFirstDay() {
  // TODO dynamically get this using web scraping from https://www.provost.umd.edu/calendar/16.cfm
  return new Date ("January 17, 2017");
}

function getSemesterLastDay() {
  // TODO dynamically get this using web scraping from https://www.provost.umd.edu/calendar/16.cfm
  return new Date ("May 13, 2017");
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
		
    var moreInfoContainer = document_root.getElementsByClassName("list-view-crn-info-div gray-background");
    
    var courseEventInfo = new Array();


    if (entireCourseContainer.length == 0 && courseInfoContainer.length == 0 && moreInfoContainer.length == 0) {
        html = "Please navigate to the [Drop/Add] Register for Classes page, and select your term. Click on schedule details, and boom!";
        validPage = false;
    } else {
        validPage = true;
    }


    for(i = 0 ; i < entireCourseContainer.length; i++) {

      var courseInfo = courseInfoContainer[i].innerText;
      html += courseInfo + "END";
    //i.e. Data Structures and Algorithms
    var classTitle = trim(entireCourseContainer[i].getElementsByClassName("section-details-link")[0].innerText);
    console.log(classTitle);
    //i.e. Computer Science 3114
    var sectionDetails = trim(entireCourseContainer[i].getElementsByClassName("list-view-subj-course-section")[0].innerText);
    sectionDetails = trim(sectionDetails.slice(0, sectionDetails.indexOf("Section") - 1));
    console.log(sectionDetails);

    var CRNContainer = document_root.getElementsByClassName("list-view-crn-schedule");

    //must parse this to find location, building, and room (no tag elements, lies within the entire wrapper)
    var locBuildRoom = trim(parseMeetingLocationBuildRoom(meetingInfoContainer[i].innerText));

    var locationIndex = locBuildRoom.indexOf("Location");
    var buildingIndex = locBuildRoom.indexOf("Building");
    var roomIndex = locBuildRoom.indexOf("Room");

    var locationStr = locBuildRoom.slice(locationIndex, buildingIndex);
    console.log()
    var location = trim(locationStr.slice(locationStr.indexOf(":") + 1));
    console.log("location: " + location);
    var buildingStr = locBuildRoom.slice(buildingIndex, roomIndex);
    var building = trim(buildingStr.slice(buildingStr.indexOf(":") + 1));
    console.log("building: " + building);
    var roomStr = locBuildRoom.slice(roomIndex);
    var room = trim(roomStr.slice(roomStr.indexOf(":") + 1));
    console.log("room: " + room);

    var typeIndex = moreInfoContainer[i].innerText.indexOf("Schedule Type:") + 15;
    var classTypeToEnd = moreInfoContainer[i].innerText.slice(typeIndex);
    var classType = classTypeToEnd.substring(0, classTypeToEnd.indexOf("|") - 1);

    var CRN = trim(CRNContainer[0].innerText);
    console.log("CRN: " + CRN);

    var meetingDays = "";
    var meetingTimes = "";
    var startTime = "";
    var endTime ="";
    courseLocation = "";
    if (location.includes("None") && building.includes("None") && room.includes("None")) { //online course
      meetingDays = "None";
      meetingTimes = "None";
      startTime = "None";
      endTime = "None";
      courseLocation = "ONLINE";
      
    }
    else {
      meetingDays = trim(meetingInfoContainer[i].getElementsByClassName("ui-pillbox-summary screen-reader")[0].innerText);
  
      //span[2] in listViewMeetingInformation = meeting times i.e. 02:30 PM - 03:45 PM
      meetingTimes = trim(meetingInfoContainer[i].getElementsByTagName("span")[2].innerText);
      startTime = trim(meetingTimes.slice(0, meetingTimes.indexOf(" -")));
      endTime = trim(meetingTimes.slice(meetingTimes.indexOf("-") + 1));
      courseLocation = location + ", " + building + " Room " + room;
    }
    
    courseTitle = sectionDetails + " " + classTitle;
    sectionCode = CRN;
    courseType = classType;
    courseStartTime = startTime; //renamed start time. could be time or "None"
    courseEndTime = endTime; //renamed "could be time or "None"
    daysStr = meetingDays; //meetingDays or "None"
    
      // separate out timecodes and parse into integers
      startHour = courseStartTime.includes("None") ? 0 : parseInt(courseStartTime.match(/(\d+)/g)[0]);
      startMin = courseStartTime.includes("None") ? 0 : parseInt(courseStartTime.match(/(\d+)/g)[1]);
      startPmAm = courseStartTime.includes("None") ? "None" : courseStartTime.substr(-2);
      endHour = courseEndTime.includes("None") ? 0 : parseInt(courseEndTime.match(/(\d+)/g)[0]);
      endMin = courseEndTime.includes("None") ? 0 : parseInt(courseEndTime.match(/(\d+)/g)[1]);
      endPmAm = courseEndTime.includes("None") ? "None" : courseEndTime.substr(-2);

      // get semester start dates
      semFirstDate = getSemesterFirstDay();
      semFirstDay = semFirstDate.getDay(); //1 2 3 4 5 6 or 7

      //separate each day of the week
        daysArray = daysStr.split(",");
        console.log("daysArray length: " + daysArray.length);
        console.log("daysArray: " + daysArray[0] + " " + daysArray[1]);
      
        for (k = 0; k < daysArray.length; k++) {

         classStartDay = 0;  // instantiate the day for comparison with semFirstDay
      
          switch(daysArray[k]) {
            case "Monday":
              classStartDay = 1;
              break;
            case "Tuesday":
              classStartDay = 2;
              break;
            case "Wednesday":
              classStartDay = 3;
              break;
            case "Thursday":
              classStartDay = 4;
              break;
            case "Friday":
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

      //Separated by commas ie: Monday, Wednesday
      console.log(meetingDays);

  
      // console.log("starttime: " + startTime);
      // console.log("endtime: " + endTime);
      // console.log("semFirstDay " + semFirstDay);
      // console.log("startHour: " + startHour);
      // console.log("startMin: " + startMin);
      // console.log("startPmAm: " + startPmAm);
      // console.log("endHour: " + endHour);
      // console.log("endMin: " + endMin);
      // console.log("endPmAm: " + endPmAm);
      // console.log("course location: " + courseLocation);
  
                
          // store individual event's data in json format
          courseEventInfo.push({
            "courseTitle": courseTitle,
            "section": sectionCode,
            "classType": courseType,
            "location": courseLocation,
            "startDate": classStartDate.toString(),
            "startPmAm": startPmAm,
            "endDate": classEndDate.toString(),
            "endPmAm": endPmAm
          });
        }
      }

    console.log(courseEventInfo);

    // TODO also return the json or array holding courses
    return [html, validPage, courseEventInfo,  getSemesterLastDay().toString()];
}

chrome.runtime.sendMessage({
    action: "getSource",
    source: DOMtoString(document)
});