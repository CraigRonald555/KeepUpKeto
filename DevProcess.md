

## Introduction 

During my time studying an Angular udemy course, I took on a personal project found here at [KeepUpKeto.com](https://keepupketo.com). 

The website aims to give keto dieters the resources to discover new recipes for a fairly restricted diet; and offers them the ability to track their daily nutritional requirements throughout the week. 

The project was based on an idea similar to something I had previously worked on at university in a group project, however, it is a lot more sophisticated in the way it looks and the way it behaves. 

## Algorithm to automatically fill a meal plan 

The first and what I thought would be the most difficult feature, is an option for the users to automatically request a full meal plan based on their food preferences and nutritional requirements. 

I used a well researched metabolic algorithm called the "Mifflin-St Jeor equation" in order to find the amount of calories a user would require in order to achieve their weight goals (lose, maintain or gain). I then found out their macronutrient requirements by dividing the calories by the necessary percentages in order to achieve ketosis. 

In other words, this gave me the user's recommended daily calories, carbs, protein and fat amounts. 

From this, I created a method which would receive the amount of calories left in a day, and the types of meals the user had already added themselves (the idea being that if a user wanted to select their own breakfast and fill in the rest of the meals automatically, then they could). Depending on how many calories the user had yet to fill in, the method would allocate the remaining nutrients to appropriate meals. 

For example, if the user's recommended daily calories is 2,000, and they have already pre-selected a breakfast containing 500 calories. The method would divide the remaining 1500 calories along with the remaining carbs, protein and fat into a plan consisting of a lunch, snack and dinner. 

The method ultimately tells the app which meals to find and how many nutrients it can allocate to each meal. This was a crucial part of making this feature work, and I believe is a prime example of my problem solving skills. 

Once I had a structure which allocated remaining nutrients to appropriate meals, it was just the case of implementing a Recipe API called 'Edamam'. 

Edamam essentially allows the app to pass parameters to their endpoints, and returns an array of detailed recipes based on the parameters. The parameters used are a selected ingredient (an ingredient from the user's list of preferred ingredients) and the amount of calories, carbs, protein and fat (taken from the method described above). 

Once the app found a suitable meal for the allocated nutrients, the meal would then be added to an array which would be displayed by using the *ngFor directive in Angular. 

After testing multiple, predicted types of people who'd use the app, and their weight goals/nutritional requirements, I was happy that the algorithm worked successfully and as I intended it to from the start. 

## Firebase Realtime Database 

The next big problem I faced was storing the data so it wouldn't be lost upon refreshing. 

One of the recommended database services my Angular course tutor used was called Firebase. Having watched a few lectures of him using it, I decided to implement it in my project. 

Although it took me a bit of time to understand the philosophy behind a No-SQL database, I was happy that the objects in my app could be stored in a similar format using JSON in Firebase. 

With very user-friendly npm packages provided by Firebase, I was able to quickly develop a user storage system in the app. 

I then developed the structure of my Firebase database so it was capable of storing all the necessary user data the app required to function properly. It took a few tweaks overtime as the requirements of the app changed, however it worked perfectly and I was very happy with the outcome. 

In order to prevent users accessing unauthorized data, I implemented Firebase's rule system in my database. 

## API call limit issue and work-around solution 

Once I had managed to store the data, and have the app retrieve and display the meal plan depending on which user was logged in. I came across a potential issue from the recipe API I mentioned earlier called 'Edamam'. 

The problem was they didn't allow data to be stored in another database, and when I calculated how much it would cost if everytime a user loaded the website, and the app made a call to retrieve recipe details, it was obvious that without being able to store the data in the database, it would make be impossible for the app to make a profit. In other words, without storing data locally the cost of making API calls would be too high. 

In an ideal world, I would've preferred to scrape the recipes from the internet myself however as this would've been a whole entire beast of a project itself, I decided to design a system which would drastically reduce the amount of calls made to the Edamam API whilst still offering a fair amount of calls to it. 

I engineered a system which utilised the local storage feature within modern browsers. This a user-end cache system and avoided the potential legal issue of storing any prohibited data in my database. 

I mentioned earlier that I thought the algorithm to find meals automatically would be the hardest part of the project, however I found storing data in a user's cache was much more trickier due to the difficulty of ensuring the data was up-to-date across multiple devices. 

After spending the majority of each day for two weeks working on engineering the system, I finally managed to create a working solution. 

As I was allowed to store the recipe IDs from Edamam in my database, everytime a user refreshed the app, the app would loop through each day and check to see whether the recipe IDs in the database matched with those in the user's local storage cache. Initially the local storage would be empty, therefore a service in the app was used to make a call to the Edamam API, and stored the recipe details in local storage. As long as the user didn't log out or clear their cache, the next time they loaded the website, the app wouldn't need to make a call to the Edamam API because the data could be retrieved from the local storage instead. 

If the user made a change (e.g. added a new recipe to Monday), and then they accessed the website from a different device, the app would detect that a new recipe ID had been added to the database. Therefore, the app would make a call to the Edamam API to retrieve the new recipe's details and store it in local storage. 

I am very proud of this feature as it's another example of my ability to take a complex problem, break it down and design a creative solution to achieve an intended purpose. 

## Updating the UI 

At this stage I had an app which allowed users to sign up, and within the click of a button, could generate a meal plan suited to their nutritional requirements and food preferences, and store the details in the database. 

Around this time I decided to focus on changing the layout of the website, although I'm confident with my programming skills, I'll admit I don't have the greatest ability to design a spectacular UI. I therefore paid for a design which was created in Photoshop from a user on fiverr.com. 

The old UI displayed all the recipes for each day in a long HTML table, however, the new UI replaced the table with owl-carousel elements which reduced the amount of scrolling by allowing the user to swipe left and right to view the meals for each day. A homepage was added which specifically shown recipes for the current day to make it easier for the user to track their daily recipes. 

Further changes were made to the landing page of the website around this time, I chose to use PayPal's API service to allow for payments as it saved me time and gave me confidence handling sensitive user information. 

Once the UI design had been upgraded, I then moved my attention to allowing users to manually search for recipes and foods (offering them more choice as opposed to everything being automatically picked for them). This involved creating a multi-step form which asked the user what day and time the meal was intended for, and whether the meal was a food or a recipe - with foods being more singular items as opposed to recipes which consists of multiple ingredients. Again, this took a few tweaks over time however I'm satisfied with the final outcome. 

## Ingredient Divider 

Another issue which came up was due to the recipes being proportionate to a fixed amount of servings. This meant, if for example, a recipe was intended for 4 servings, there was no way other than a custom solution to show the ingredient amounts for a single serving. 

I created an ingredient dividing service which used Regex to find things like fractions within an ingredient string, then divided them appropriately to show how much would be required for a single serving. 

This was a tedious process and I believe a better solution could be implemented however it's a problem which is a lot more difficult when you start to look into it. If all ingredients had a similar format like "2 eggs", it'd be straightforward however, when there's an ingredient string like "50g of 70% dark chocolate" it becomes a bit less straight-forward as the 50 should be divided but the 70 shouldn't. This is something I'll have to revise in the future, however it's okay for the most-part. 

## Shopping Basket 

A cool feature which I wanted to add was the ability for users to checkout the ingredients in their meal plan, directly from my website, in just a few steps. I believed this feature would separate my app from similar competitors out there who did not seem to have this functionality. 

I achieved it by implementing an API called Whisk. By using an SDK package provided by them, users had access to simply click 'Add to Basket', next to a day. This allowed them to shop for their ingredients from many different retailers from across the world. 

## Chart.js 

A final feature which I added allowed users to track their weight loss/gain. By connecting a form to the Firebase database, users could select their weight, the day they weighed in, then save it to their record. 

By using Chart.js, I was able to visually display the data in a user-friendly manner. 

## Storage 

To make the app more personal to the user, I added a feature which implements Firebase's storage system. This allowed users to upload their own profile picture which is displayed on their home screen. 

## Summary 

Overall I'm very happy with how my project works. It took a lot of determination to overcome some of the issues throughout the process of making it, and to get everything working as intended. I believe this project demonstrates many of my abilities and key assets. I set out a goal at the beginning of the project with the intention to make an application which can provide support for people on a ketogenic diet, and with the features I've implemented I like to believe I've done that. 

Furthermore, I believe this project displays my potential to succeed within a software development career. I chose technologies which were appropriate for the amount of time and purpose of the task, and despite having a fairly limited knowledge at start for frameworks like Angular and services such as Firebase, I managed to see the project through to the end, which now just requires a few tweaks and documentation.
