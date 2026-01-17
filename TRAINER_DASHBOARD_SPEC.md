# Trainer Dashboard - אפיון (Specification)

## Overview
A comprehensive web-based dashboard for trainers to manage multiple trainees, monitor their progress, create workout programs, and track nutrition goals.

---

## 🎯 Core Features

### 1. **Dashboard Overview**
**Purpose:** Quick snapshot of all trainees and key metrics

**Components:**
- **Stats Cards:**
  - Total Active Trainees
  - Trainees Needing Attention (inactive > 3 days)
  - Total Workouts Completed This Week
  - Average Compliance Rate (% of goals met)

- **Recent Activity Feed:**
  - Latest workout completions
  - Goal achievements
  - New trainee requests
  - Weight milestones

- **Quick Actions:**
  - Add New Trainee
  - Create Workout Template
  - Send Group Message
  - Generate Report

---

### 2. **Trainees Management**
**Purpose:** Central hub for managing all trainee relationships

**Features:**
- **Trainees List View:**
  - Grid/List toggle
  - Search and filter (by name, status, compliance)
  - Sort by: Name, Last Activity, Compliance Rate, Join Date
  - Status badges: Active, Inactive, Needs Attention

- **Trainee Card/Row:**
  - Profile picture + name
  - Last activity date
  - Compliance rate (nutrition + workouts)
  - Current weight trend (↑/↓)
  - Quick stats: This week's workouts, calories avg
  - Action buttons: View Details, Message, Remove

- **Trainee Details Panel:**
  - Full profile information
  - Nutrition goals (current vs. target)
  - Active workout programs
  - Progress charts (weight, macros, workouts)
  - Communication history
  - Notes section

---

### 3. **Nutrition Monitoring**
**Purpose:** Track and manage trainee nutrition goals

**Features:**
- **Daily Nutrition View:**
  - Calendar view showing daily compliance
  - Color coding: Green (met goals), Yellow (partial), Red (missed)
  - Click date to see detailed daily breakdown

- **Macro Analysis:**
  - Weekly averages per trainee
  - Comparison charts (protein, carbs, fats)
  - Trend analysis over time
  - Goal vs. actual visualization

- **Meal Logging Review:**
  - View trainee's diary entries
  - Filter by meal type (breakfast, lunch, dinner, snacks)
  - Search food items
  - Add comments/feedback on meals

- **Goal Management:**
  - Edit trainee's calorie goals
  - Adjust macro percentages
  - Set custom targets for specific days
  - Create nutrition plans/templates

---

### 4. **Workout Program Management**
**Purpose:** Create, assign, and monitor workout programs

**Features:**
- **Program Templates:**
  - Create reusable workout templates
  - Organize by: Goal (bulk, cut, maintain), Duration, Difficulty
  - Clone and customize for specific trainees

- **Assigned Programs:**
  - View all programs assigned to trainees
  - See completion status
  - Track adherence (completed vs. scheduled)
  - Modify programs for individual trainees

- **Workout Builder:**
  - Drag-and-drop exercise selection
  - Set sets, reps, weight, RPE/RIR
  - Add rest times
  - Include exercise notes/instructions
  - Preview workout before assigning

- **Session Monitoring:**
  - View completed workout sessions
  - See actual vs. planned performance
  - Track progression over time
  - Add trainer notes/feedback

- **Exercise Library:**
  - Browse all available exercises
  - Filter by muscle group, equipment
  - View exercise details and instructions
  - Add custom exercises

---

### 5. **Progress Analytics**
**Purpose:** Visual insights into trainee progress

**Features:**
- **Weight Progress:**
  - Line chart showing weight over time
  - Set target weight and track progress
  - Compare multiple trainees
  - Export data

- **Workout Performance:**
  - Volume progression charts
  - Strength gains (1RM estimates)
  - Exercise-specific progress
  - Frequency analysis

- **Nutrition Compliance:**
  - Weekly compliance percentage
  - Macro distribution over time
  - Calorie adherence chart
  - Meal timing analysis

- **Custom Reports:**
  - Generate PDF reports
  - Select date ranges
  - Include specific metrics
  - Email to trainee

---

### 6. **Communication Hub**
**Purpose:** Stay connected with trainees

**Features:**
- **Messaging:**
  - In-app messaging system
  - Group messages
  - Message templates
  - Read receipts

- **Notifications:**
  - Trainee achievements
  - Missed workouts/nutrition goals
  - New trainee requests
  - System alerts

- **Notes & Feedback:**
  - Private notes per trainee
  - Session feedback
  - Goal adjustments notes
  - Progress milestones

---

### 7. **Trainee Requests**
**Purpose:** Manage incoming trainer requests

**Features:**
- **Pending Requests:**
  - List of users requesting trainer
  - View trainee profile preview
  - Accept/Reject actions
  - Bulk actions

- **Request History:**
  - All past requests
  - Filter by status
  - Search functionality

---

### 8. **Settings & Profile**
**Purpose:** Trainer account management

**Features:**
- **Profile:**
  - Edit trainer information
  - Upload profile picture
  - Set availability
  - Specializations/tags

- **Preferences:**
  - Notification settings
  - Default program templates
  - Email preferences
  - Dashboard layout

- **Billing (Future):**
  - Subscription management
  - Payment history
  - Pricing tiers

---

## 📐 Layout Structure

### **Navigation (Left Sidebar)**
```
🏠 Dashboard
👥 Trainees
📊 Analytics
💪 Workouts
🍎 Nutrition
💬 Messages
⚙️ Settings
```

### **Header (Top Bar)**
- Search (trainees, workouts, exercises)
- Notifications bell
- Profile avatar + dropdown
- Quick switcher (View as trainee)

### **Main Content Area**
- Tabbed interface for different sections
- Breadcrumbs for navigation
- Action buttons (contextual)
- Filters and search bars

---

## 🎨 Design Principles

### **Visual Hierarchy:**
1. **Primary Actions:** Large, prominent buttons
2. **Secondary Actions:** Smaller, outlined buttons
3. **Information:** Cards with clear data visualization
4. **Status Indicators:** Color-coded badges and icons

### **Color Coding:**
- **Green:** Goals met, positive trends, active
- **Yellow:** Partial compliance, needs attention
- **Red:** Goals missed, inactive, alerts
- **Blue:** Primary actions, links
- **Gray:** Inactive, disabled states

### **Data Visualization:**
- Line charts for trends (weight, volume)
- Bar charts for comparisons (macros, compliance)
- Pie charts for distributions (macro split)
- Heatmaps for calendar views (nutrition compliance)
- Progress bars for goals

---

## 📱 Responsive Design

### **Desktop (Primary):**
- Full sidebar navigation
- Multi-column layouts
- Rich data tables
- Hover interactions

### **Tablet:**
- Collapsible sidebar
- 2-column layouts
- Touch-friendly buttons

### **Mobile:**
- Hamburger menu
- Single column
- Bottom navigation for key actions
- Swipe gestures

---

## 🔄 User Flows

### **Flow 1: Adding a New Trainee**
1. Click "Add Trainee" → Search user
2. Send trainer request
3. Wait for approval
4. Trainee appears in list
5. Set initial goals and assign program

### **Flow 2: Monitoring Daily Progress**
1. Open Dashboard → See overview
2. Click on trainee card → View details
3. Check nutrition compliance for today
4. Review completed workouts
5. Add feedback/notes if needed

### **Flow 3: Creating Workout Program**
1. Navigate to Workouts → Templates
2. Click "Create Template"
3. Add exercises, sets, reps
4. Save as template
5. Assign to trainee(s)
6. Monitor completion

### **Flow 4: Generating Progress Report**
1. Select trainee → Analytics tab
2. Choose date range
3. Select metrics to include
4. Generate report
5. Review and send to trainee

---

## 🚀 Future Enhancements

1. **AI Recommendations:**
   - Suggest workout modifications
   - Nutrition adjustments based on progress
   - Optimal rest day recommendations

2. **Group Programs:**
   - Create programs for multiple trainees
   - Group challenges
   - Leaderboards

3. **Video Integration:**
   - Exercise demonstration videos
   - Form check submissions
   - Video feedback

4. **Integration:**
   - Wearable device sync
   - Calendar integration
   - Payment processing

5. **Advanced Analytics:**
   - Predictive modeling
   - Injury risk assessment
   - Performance optimization

---

## 📊 Key Metrics to Display

### **Per Trainee:**
- Compliance Rate (Nutrition + Workouts)
- Weight Change (weekly/monthly)
- Average Daily Calories
- Workout Frequency
- Strength Progression
- Last Activity Date

### **Aggregate:**
- Total Active Trainees
- Average Compliance Across All Trainees
- Most Active Trainee
- Trainee Needing Most Attention
- Total Workouts Completed (period)
- Average Weight Loss/Gain

---

## 🎯 Success Criteria

1. **Efficiency:** Trainer can monitor 10+ trainees in < 5 minutes
2. **Clarity:** All key metrics visible at a glance
3. **Actionability:** Quick access to common tasks
4. **Insights:** Clear progress visualization
5. **Communication:** Easy trainee interaction

---

## 📝 Technical Considerations

### **Data Requirements:**
- Real-time updates for trainee activities
- Efficient data aggregation for analytics
- Caching for frequently accessed data
- Pagination for large trainee lists

### **Performance:**
- Lazy loading for charts and heavy components
- Optimistic UI updates
- Background data sync
- Efficient filtering and sorting

### **Security:**
- Role-based access control
- Data privacy (trainer can only see their trainees)
- Secure messaging
- Audit logs for sensitive actions

---

This specification provides a comprehensive foundation for building a powerful trainer dashboard that empowers trainers to effectively manage and guide their trainees toward their fitness goals.
