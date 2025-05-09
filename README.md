# CASAMANCE Dashboard Project Background Script

**Project Files:**

- [Module Controller](CODE/NEW/DailyDashboard_NewLogic1/DailyDash_New%20[Module%20Controller].js)

- [Headers Module](CODE/NEW/DailyDashboard_NewLogic1/DailyDash_New%20[Headers].js)
- [Dashboard Config](CODE/NEW/DailyDashboard_NewLogic1/DailyDash_New%20[DashboardConfig].js)
- [Layout Utilities](CODE/NEW/DailyDashboard_NewLogic1/DailyDash_New%20[LayoutUtils].js)
- [KPI Tiles](CODE/NEW/DailyDashboard_NewLogic1/DailyDash_New%20[KPI%20Titles].js)
- [Response Data](Customer%20Feedback%20%20Form%20(Responses).xlsx)
- [SVG Wireframe](Visuals/SVG%20WireFrame/ChatGPT_DailyDash_Proposed.svg)
- [Latest Screenshot](Visuals/Screenshots/New_DailyDashboard1/DailyDash1_@_Implementing_DropDownSource_insideSheet[SUCCESS]%20+%20ISSUE:%20Some%20KPI%20figues%20missing%20[RESOLVED].png)
- [Google Sheet saved as Excel](Customer%20Feedback%20%20Form%20(Responses).xlsx)

## Project Context

...

I'm developing a customized dashboard for CASAMANCE, a company that distributes textile products to design professionals. The dashboard tracks sales representative performance based on customer feedback collected through Google Forms, with a focus on a reward system for representatives who achieve specific 5-star rating milestones (10, 15, or 20 five-star ratings earn rewards of £500, £750, and £1,000 respectively).

The dashboard system has the following requirements:

- Daily, weekly, and monthly views to track performance
- KPI indicators showing submissions, ratings, and negative cases
- Rep performance tracking tied to a reward system
- Negative feedback queue for quick customer retention
- Time and distribution analysis for better resource allocation

I've successfully implemented the dashboard header and KPI tiles sections, and need help implementing the remaining components.

## Current Implementation Status

I've built a modular codebase in Google Apps Script with these modules:

1. **Module Controller**: Central dashboard refresh system
2. **Headers**: Dashboard title and date display
3. **DashboardConfig**: Configuration and data source selection system
4. **LayoutUtils**: Common styling and layout utilities
5. **KPI Tiles**: The key metrics section showing 4 main KPIs

## Current Dashboard Overview

The dashboard has a clean, modern interface with these elements:

- A header with title and timestamp

- 4 KPI tiles showing:
  - Submissions Today (with day-over-day change)
  - Average Rating (with highlighting and change indicator)
  - 5-Star Ratings (with percentage context)
  - Negative Cases Percentage (with action item count)
- Data source selector for testing with different data sheets

## Key Implementation Features

The code is structured to maintain separation of concerns:

- Layout and styling functions are separated from data processing logic
- Configuration is centralized for easy changes
- Error handling and fallbacks are in place for missing data

## Code Files

I have the following JavaScript files in my Google Apps Script project:

### DailyDash_New [Module Controller].js

> Latestest Update to be found at [DailyDash_New [Module Controller].js](CODE/NEW/DailyDashboard_NewLogic1/DailyDash_New%20[Module%20Controller].js)

### DailyDash_New [DashboardConfig].js

> Latestest Update to be found at [DailyDash_New [DashboardConfig].js](CODE/NEW/DailyDashboard_NewLogic1/DailyDash_New%20[DashboardConfig].js)

### DailyDash_New [LayoutUtils].js

> Latestest Update to be found at [DailyDash_New [LayoutUtils].js](CODE/NEW/DailyDashboard_NewLogic1/DailyDash_New%20[LayoutUtils].js)

## Sheet Structure

The Google Sheet has the following key sheets:

1. **DailyDash**: The main dashboard sheet where all visualizations are displayed
2. **Form Responses 1**: Contains actual form submission data (when connected to a real form)
3. **TestData**: Contains simulated data for testing the dashboard
4. **DashConfig**: Hidden sheet storing dashboard configuration

## Form Structure

The feedback form collects the following data points:

- Timestamp

- Customer email

- Representative name

- Whether needs were met

- Satisfaction with presentation

- Information and product knowledge

- Customer feedback comments

- Rating on a scale of 1-5 stars

## Next Steps

The next components to implement are:

1. **Rep Performance Table**: Shows detailed metrics for each rep, including 5-star count progress toward milestones

2. **Milestone Alerts**: Displays reps who've reached reward milestones (10/15/20 five-star ratings) with reward amounts

3. **Negative Feedback Queue**: Lists recent negative feedback cases (ratings ≤2 or "No" responses) for quick follow-up

4. **Rating Distribution**: Visual chart showing the distribution of ratings (1-5 stars)

5. **Submission Time Analysis**: Shows when submissions occur throughout the day for staffing insights

Each component should follow the same pattern:

- Clear separation between layout and data processing
- Proper error handling
- Consistent styling using the LayoutUtils module
- Integration with the configuration system
