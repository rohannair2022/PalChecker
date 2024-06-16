# About 
PalChecker is an interactive daily checker for tracking and maintining a good lifestyle to balance mental health. The project was created for thr IngeniumStem-2024 Hackathon. 

# Sponsor Tech Used

  1) Balsamiq: Wireframes
  2) XYZ: Domain Name

# Contributions
  
  1) ### Rohan Nair  :  Hybrid AI Model and Backend Calender (Database)
     During the three day Hackathon I created the hybrid AI model that was used to predict the likelihood if someones day went bad or not. After obtaining the dataset from my teammate Rahul Nair, I pre-proccessed and visualized the dataset to decide        which model I should train it on. Upon visualizing the pre-proccsed data, it was evident that the data was non-linear and needed a supervised model. Therefore, I decided to choose the Random Forest Regression model to do so. The model had a            medicore-bad MSQE score of 0.30. Therefore, I deicded to pair the model up with Meta's LLama2 LLM model to give it a more trained and reduce the bias in the predictive model answer.
     
     Additionally, I also worked on creating the indexedDB specifically for the calender feature of our website. Everytime the user lands on the front page, I store the date and time the user landed on the indexedDB. If the indexedDB does not exist         then I create it along with the tables and columns. Finally, when the calendar code is rendered, I update all the dates on the front-end calendar (indicated by a green mark) that are entered in the database by searching through all elements.

     ![Part1: Steps taken to create Hybrid AI  Model](MLModel/Untitled.png?raw=true "Part1: Steps taken to create Hybrid AI  Model")
     ![Part2: Steps taken to create Hybrid AI  Model](MLModel/ReadMePt2.jpg?raw=true "Part2: Steps taken to create Hybrid AI  Model")
     ![Part2: Steps taken to create Hybrid AI  Model](MLModel/ReadmePt3.png?raw=true "Part2: Steps taken to create Hybrid AI  Model")
     
  3) ### Rahul Nair  :  Wireframes, Presentation Slides, Research
  4) ### Preet Patel - Front-end 
  5) ### Yongho(Mark) Nam : Back-end (EC2, Python)
