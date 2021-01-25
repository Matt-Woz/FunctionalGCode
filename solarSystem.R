
#!/usr/bin/env Rscript


#Main function which creates the table
createTable <- function(data){
	arr <- calculateRanges(data)
	arr <- as.numeric(arr)
	start <- arr[-11] #Removes last number for start column
	end <- arr[-1] #Removes first number for end column
	h<-hist(as.numeric(data[,1]), plot = FALSE, breaks = arr) #Histogram for number in each section
	number<-h$counts
	table<- data.frame(start,end, number) #Creates data frame
	table$mean<- round(apply(table, 1, closureDataFnFromTo(times, mean)), 3)
	table$sd<- round(apply(table, 1, closureDataFnFromTo(times, sd)), 3)
	table$range <- paste(table$start,'->',table$end) #Combines start and end columns into 1
	table<- table[-c(1,1:2)] #Removes first 2 columns
	table<-table[,c(4, 1:3)] #Adds pasted range column to the front
	return(table)

}
closureDataFnFromTo<-function(data,fn){
	function(df) fn(data[data>df["start"] & data<=df["end"]])
}

#Calculates and rounds ranges for 10 equal sizes
calculateRanges<- function(data){
  ranges <- (max(data) + min(data)) / 10
  ranges <- round(ranges, 4)
  ranges <- seq(0,round(max(data),2),by=ranges)
  ranges<-lapply(ranges,round,3)
  return (ranges)
}

ourData <- read.table("Times.csv",
					  header = FALSE,
					  sep = ",",
					  stringsAsFactors = FALSE)
p <- createTable(ourData)
write.table(p, "solarSystem.tab", append = FALSE, sep = ",", dec = ".",
			row.names = FALSE, col.names = TRUE)