export const T = {
  // Page Title
  title: "Portuguese Election Forecast Model",

  // Hero Banner Probabilities
  heroLeftMajorityProb: "Left Bloc Majority Prob.",
  heroLeftMajorityCondition: "(PS+BE+CDU+L ≥ 116)",
  heroRightMajorityProb: "Right Bloc Majority Prob.",
  heroRightMajorityCondition: "(AD+IL ≥ 116)",
  heroNoMajorityProb: "No Bloc Majority Prob.",
  heroNoMajorityCondition: "(Neither bloc ≥ 116)",
  heroAdMostSeatsProb: "AD Most Seats Prob.",
  heroAdMostSeatsCondition: "(AD > PS and AD > CH)",
  heroPsMostSeatsProb: "PS Most Seats Prob.",
  heroPsMostSeatsCondition: "(PS > AD and PS > CH)",
  heroChMostSeatsProb: "CH Most Seats Prob.",
  heroChMostSeatsCondition: "(CH > AD and CH > PS)",

  heroRightPlusVsLeftPlusProb: "AD+IL > PS+L+PAN+BE+CDU Prob.",
  heroRightPlusVsLeftPlusCondition: "AD+IL more seats than PS+L+PAN+BE+CDU",

  // Methodology Section
  methodologyTitle: "How Our Dynamic Gaussian Process Election Model Works",
  methodologyP1: "We've developed a statistical forecasting model for Portuguese elections that captures both long-term political trends and district-level dynamics. It represents an evolution of traditional election models, designed specifically to address the challenges of Portugal's multi-party, district-based electoral system. This document explains the approach, intuition, and technical details behind our methodology.",
  methodologyH4_1: "The Challenge of Forecasting Portuguese Elections",
  methodologyP2: "Portugal's electoral landscape presents unique forecasting challenges. The country has multiple significant political parties ranging from the traditional center-left (PS) and center-right (AD) to newer entrants like the liberal IL and right-wing Chega. Elections are decided through a proportional representation system across multiple districts, with seats allocated using the D'Hondt method.",
  methodologyP3: "Traditional forecasting approaches struggle with several aspects of this system:",
  methodologyLi1_1: "District-level variation in political support that doesn't uniformly follow national trends",
  methodologyLi1_2: "Different parties having varying sensitivity to national sentiment shifts",
  methodologyLi1_3: "Campaign dynamics that can shift rapidly during election season",
  methodologyLi1_4: "Pollster-specific biases that need correction",
  methodologyP4: "Our dynamic Gaussian process model addresses these challenges through a principled Bayesian statistical framework.",
  methodologyH4_2: "The Intuition Behind the Model",
  methodologyP5: "Our model works by breaking down party support into several components:",
  methodologyLi2_1: "<strong>Long-term national trends</strong>: The baseline support for each party over extended periods",
  methodologyLi2_2: "<strong>Short-term fluctuations</strong>: Changes in support during campaign periods",
  methodologyLi2_3: "<strong>District-specific patterns</strong>: How each district deviates from national trends",
  methodologyLi2_4: "<strong>Pollster effects</strong>: Systematic biases in how polling firms measure support",
  methodologyLi2_5: "<strong>Uncertainty</strong>: The probabilistic range of possible outcomes",
  methodologyP6: "The \"dynamic\" in our model name refers to its ability to capture changing support patterns over time, while \"GP\" (Gaussian Process) refers to the statistical technique that allows us to model smoothly varying support without imposing rigid assumptions about how it changes.",
  methodologyP7: "Unlike simpler approaches that rely on uniform national swing (where all districts are assumed to shift by the same amount), our model allows for differential shifts. When national support for party A increases by 5 percentage points, some districts might shift by 8 points, while others barely move. The model learns these patterns from historical data.",
  methodologyH4_3: "How the Model Functions",
  methodologyP8: "Imagine a party's support level as an invisible line that evolves continuously over time. We never observe this line directly—we only see noisy snapshots from polls or election results. Our model reconstructs the most likely trajectory of this line by combining:",
  methodologyLi3_1: "Prior knowledge about typical political changes",
  methodologyLi3_2: "Information from polls",
  methodologyLi3_3: "Historical election results",
  methodologyLi3_4: "District-specific patterns",
  methodologyLi3_5: "Knowledge about how pollsters tend to measure",
  methodologyP9: "When the model forecasts an upcoming election, it projects these components forward in time and aggregates them into probabilistic vote shares for each party in each district. These are then translated into seat allocations using the D'Hondt method.",
  methodologyH4_4: "Technical Components of the Model",
  methodologyH5_1: "1. Baseline GP over Calendar Time",
  methodologyP10: "The foundation of the model is a smooth, long-term trend representing the baseline national support for each party. This is modeled as a Gaussian Process evolving over calendar time. The properties of this GP (specifically its covariance structure) are chosen to reflect assumptions about the slow, gradual nature of fundamental political shifts, capturing dependencies over multiple years.",
  methodologyH5_2: "2. Medium-Term GP over Calendar Time",
  methodologyP11: "Superimposed on the baseline trend is a second Gaussian Process, also evolving over calendar time. This component is designed with a moderate correlation length (e.g., centered around a year), allowing it to capture deviations from the long-term baseline over medium timescales. This could reflect evolving responses to specific events or other medium-term dynamics.",
  methodologyH5_3: "3. Very Short-Term GP over Calendar Time",
  methodologyP12: "A third Gaussian Process, again over calendar time, is added to capture even more rapid fluctuations. This GP has a very short correlation length (e.g., centered around a few weeks). It is designed to model fast-moving campaign dynamics, late shifts in public opinion, or reactions to breaking news closer to an election.",
  methodologyP13: "The sum of these three processes (baseline, medium-term, very short-term) forms the latent (unobserved) national support trajectory for each party.",
  methodologyH5_4: "4. District-Level Effects",
  methodologyP14: "To account for Portugal's district-based system, the model incorporates district-specific deviations from the national trend. In the current implementation, this is achieved solely through estimated <strong>static base offset</strong> parameters for each district and party. These parameters represent the persistent, time-invariant tendency for a district's support for a given party to be higher or lower than the national average, relative to the average trend. These offsets are learned primarily from historical election results at the district level. Unlike previous experimental versions, this model <em>currently uses only these static offsets</em>. It assumes that district deviations from the national trend do not dynamically change based on the magnitude of national swings within a single election cycle (i.e., the sensitivity or 'beta' component is not currently active).",
  methodologyH5_5: "5. House Effects (Pollster Biases) and Poll Bias",
  methodologyP15: "The model explicitly accounts for systematic variations between polling firms. These \"house effects\" are modeled as parameters specific to each pollster and party, constrained such that they represent relative deviations (i.e., summing to zero across parties for a given pollster). This captures the tendency of some pollsters to relatively overestimate or underestimate certain parties.",
  methodologyP16: "Additionally, an overall poll bias term, also constrained to sum to zero across parties, is included. This captures any average systematic deviation of poll results from the underlying national trend, distinct from individual pollster effects.",
  methodologyH5_6: "6. Latent Score, Transformation, and Likelihood",
  methodologyP17: "The national trend components (sum of the three calendar-time GPs) are combined with the relevant bias terms (house effects and poll bias for poll observations, or the static district base offsets for district predictions) to produce a latent score representing underlying support.",
  methodologyP18: "A softmax transformation converts these unbounded latent scores into a set of probabilities (vote shares) for each party that necessarily sum to one.",
  methodologyP19: "Finally, the observed data—vote counts from polls, district-level election results, <strong>and national-level election results</strong>—are linked to these modeled probabilities through a statistical likelihood function. The chosen likelihood (typically a Dirichlet-Multinomial distribution) is suitable for count data representing proportions and includes parameters to accommodate potential overdispersion (more variability than predicted by simpler models). The inclusion of both district and national results helps anchor the national trend prediction and inform the district offsets.",
  methodologyH4_5: "Statistical Methodology",
  methodologyH5_7: "Gaussian Processes",
  methodologyP20: "Gaussian Processes provide a flexible, non-parametric Bayesian approach to function estimation. Here, they are used to model the unobserved national support trends over time without imposing rigid functional forms. The choice of covariance kernel and its parameters (lengthscale, amplitude) encode prior beliefs about the smoothness and variability of these trends.",
  methodologyH5_8: "Hierarchical Modeling",
  methodologyP21: "The model employs a hierarchical structure, particularly for house effects and district offsets. Parameters for individual pollsters or districts are assumed to be drawn from common distributions, allowing the model to borrow strength across units and make more robust estimates, especially for units with less data.",
  methodologyH5_9: "Bayesian Inference",
  methodologyP22: "The model parameters are estimated within a Bayesian framework, typically using Markov Chain Monte Carlo (MCMC) methods. This yields a full posterior distribution for all parameters and derived quantities (like vote shares and seat predictions), naturally quantifying uncertainty.",
  methodologyH5_10: "Computational Techniques",
  methodologyP23: "To make Bayesian inference computationally feasible, the model utilizes:",
  methodologyLi4_1: "<strong>GP Approximations:</strong> Efficient methods (like basis function expansions) are used to approximate the full Gaussian Processes, reducing the computational complexity.",
  methodologyLi4_2: "<strong>Reparameterization:</strong> Techniques like non-centered parameterization are used for certain hierarchical parameters to improve the geometry of the posterior distribution and the efficiency of MCMC sampling algorithms.",
  methodologyH5_11: "Overdispersion Modeling",
  methodologyP24: "The use of a likelihood function that explicitly models overdispersion (like the Dirichlet-Multinomial) is crucial for realistically capturing the noise characteristics of polling and election data.",
  methodologyH4_6: "Making Predictions",
  methodologyP25: "Generating forecasts involves several steps:",
  methodologyLi5_1: "Draw samples from the joint posterior distribution of all model parameters obtained via Bayesian inference.",
  methodologyLi5_2: "For each sample, compute the latent national support trend (sum of the three calendar-time GPs) at the desired future date(s).",
  methodologyLi5_3: "Apply the relevant district-specific <strong>static base offset</strong> parameters (as estimated from the posterior) to the national latent trend to get district-level latent scores.",
  methodologyLi5_4: "Convert these latent scores into predicted vote share probabilities using the softmax transformation.",
  methodologyLi5_5: "Simulate the seat allocation process (D'Hondt method) using these predicted vote shares for each posterior sample.",
  methodologyP26: "Aggregating the results across all posterior samples provides a probabilistic forecast for vote shares and seat counts, inherently reflecting model uncertainty.",
  methodologyH5_12: "District Vote Share Prediction",
  methodologyP27: "District-level vote share predictions are derived by combining the posterior distribution of the national latent trend (sum of the three calendar-time GPs) with the posterior distribution of the <strong>static</strong> district base offsets.",
  methodologyP28: "Specifically, for each posterior sample and each district:",
  methodologyLi6_1: "The estimated <strong>static base offset</strong> for that district and party is added to the national latent trend value (sum of the three GPs) for that party at the target date.",
  methodologyLi6_2: "The resulting adjusted latent scores are transformed into probabilities (vote shares summing to 1) via the softmax function.",
  methodologyP29: "This procedure yields a full posterior distribution of predicted vote shares for each party within each district.",
  methodologyH5_13: "Seat Allocation",
  methodologyP30: "Once we have vote share predictions, we simulate the election outcome using the D'Hondt method, which allocates seats proportionally based on each party's votes. By running this simulation thousands of times across our posterior samples, we generate a probability distribution over possible seat outcomes for each party.",
  methodologyH4_7: "Limitations and Future Improvements",
  methodologyP31: "Like all models, ours has limitations based on its current structure:",
  methodologyLi7_1: "It assumes that historical patterns of <em>static</em> district behavior (relative to the nation, captured by the base offsets) will continue into the future. The model currently does not account for potential dynamic changes in how districts respond to national swings within a cycle.",
  methodologyLi7_2: "It does not incorporate non-polling data such as economic indicators or government approval ratings.",
  methodologyLi7_3: "The district effects model could potentially be enhanced in future versions by re-introducing dynamic components (like sensitivity/beta), adding district-level covariates, or incorporating spatial correlation structures.",
  methodologyP32: "Future versions may address these limitations by incorporating additional data sources (like economic indicators), activating dynamic district effects, using district-level covariates (such as demographics or past voting patterns) to better model the static offsets, or implementing spatial modeling techniques to capture correlations between neighboring districts.",
  methodologyP33_sources: "<strong>Sources:</strong>",
  methodologyLi8_1: "Poll data: Aggregated from publicly available polls.",
  methodologyLi8_2: "Election results: Official results from the Portuguese Electoral Commission (CNE) and other historical archives.",
  methodologyLi8_3: "Economic data: Relevant economic indicators from national and international statistical agencies.",

  // Forecast Comparison Table
  forecastCompUnavailable: "Forecast comparison data is not available at this time.",
  forecastCompTitle: "Forecast Evolution: Comparison with Previous Run",
  forecastCompSubtitle1Part1: "Comparing current forecast (dated: ", // Placeholder for ${runADate}
  forecastCompSubtitle1Part2: ") with previous forecast (dated: ", // Placeholder for ${runBDate}
  forecastCompSubtitle1Part3: ").",
  forecastCompSubtitle2Part1: "Comparison generated on: ", // Placeholder for ${new Date(data.metadata.comparison_timestamp).toLocaleDateString()}
  forecastCompSubtitle2Part2: ".",
  forecastCompH3_Vote: "National Vote Share Evolution",
  forecastCompH3_Seats: "Seat Projection Comparison",
  forecastCompThParty: "Party",
  forecastCompThCurrent: "Current Run",
  forecastCompThPrevious: "Previous Run",
  forecastCompThChange: "Change",
  forecastCompDateUnavailable: "N/A",

  // Annotations
  annoRow1: "Seat projections show likely outcomes for each party, with 116 seats needed for a majority (red line). The first chart displays the seat distribution per party, while the second illustrates the distribution of total seats for the left and right coalition blocs.",
  annoRow2: "District map colored by predicted leading party in each region. Click any district to see detailed vote share forecasts, or view national trends in the right panel when no district is selected.",
  annoRow3: "Most contested seats across Portugal where small shifts could change outcomes. The table shows seats closest to flipping, with probability breakdown bars showing which parties might win each seat. Click any row for detailed analysis.",
  annoRow4: "Left: National voting intention trends with 95% credible intervals, combining polling data since 2024. Right: Estimated polling house effects showing systematic biases — red indicates pollsters overestimating parties, blue shows underestimation.",

  // Section Titles (within card divs)
  seatProjectionTitle: "Seat Projection",
  coalitionTotalsTitle: "Coalition Totals Distribution",
  districtForecastTitle: "District Forecast & Details",
  nationalVoteIntentionTitle: "National Vote Intention",
  nationalVoteIntentionNote: "Modeled national vote share for major parties over time.",
  pollsterHouseEffectsTitle: "Pollster House Effects",
  averagePollBiasTitle: "Average Poll Bias",

  // Shared Poll Analysis Section
  pollAnalysisTitle: "Poll Analysis: House Effects & Average Bias",
  pollAnalysisNote: "The color scale indicates poll deviations: Brown suggests polls tend to overestimate a party's support, while Green suggests underestimation. The intensity reflects the magnitude of the deviation. Zero (light neutral) means balanced. <br><b>Pollster House Effects (heatmap):</b> Shows how individual pollsters tend to deviate for specific parties. <br><b>Average Poll Bias (list):</b> Shows the overall tendency of polls for each party.",
  legendOverestimation: "Overestimation",
  legendUnderestimation: "Underestimation",
  legendBalanced: "(0 = Balanced)",

  // Footer
  footerModelBy: "Model and visualizations by Estimador.",
  footerLastUpdated: "Last updated: ", // Placeholder for ${new Date().toLocaleDateString()}
  footerDataSources: "Data sources: Polling aggregation from national pollsters (Aximage, CESOP, Eurosondagem, Intercampus), historical election results from CNE, and demographic data from INE.",
  footerAttribution: "This project was developed by estimador.pt, Bernardo Caldas (info@estimador.pt).",

  // National Trends Chart
  trendsChartYLabel: "National Vote Intention (%)",
  trendsChartXLabel: "Date",
  trendsChartTooltipTitle: "{party}\n{low}% - {high}%",

  // Seat Projection Chart
  seatProjectionLoading: "Seat projection data loading...",
  seatProjectionXLabel: "Seats won",

  // Coalition Dot Plot
  coalitionDotPlotLoading: "Coalition data loading...",
  coalitionDotPlotLeftBloc: "Left Bloc",
  coalitionDotPlotRightBloc: "Right Bloc",
  coalitionDotPlotXLabel: "Total Seats Won by Bloc",
  coalitionDotPlotTooltipTitle: "{bloc}\nTotal Seats: {totalSeats}",

  // House Effects Heatmap
  houseEffectsDataUnavailable: "House effects data not available.",
  houseEffectsNoVariation: "House effects data shows no variation.",
  houseEffectsTooltipTitle: "{pollster} - {party}\nEffect: {effect} pp",
  houseEffectsLegendOver: "Over-estimates",
  houseEffectsLegendUnder: "Under-estimates",
  houseEffectsLegendZero: "0",

  // Contested Table
  contestedTableDataUnavailable: "Contested district data is unavailable.",
  contestedTableHeaderDistrict: "District",
  contestedTableHeaderVolatility: "Volatility (ENSC)",
  contestedTableHeaderVolatilityTitle: "Expected Number of Seat Changes vs Modal",
  contestedTableSeatsSuffix: " seats",

  // Contested District Detail
  contestedDetailPlaceholder: "Click a district row to see details.",
  contestedDetailHeaderVolatility: "Volatility (ENSC): ",
  contestedDetailTrendXLabel: "Seat Change vs 2024",
  contestedDetailTrendTooltip: "{party}: {delta} vs 2024", // {delta} will include +/- sign
  contestedDetailTrendError: "Trend chart error: ",
  contestedDetailTrendNoData: "No trend data available for this district.",
  contestedDetailVolatilityXLabel: "Probability vs Modal Forecast",
  contestedDetailTypeLoss: "Loss",
  contestedDetailTypeNoChange: "No Change",
  contestedDetailTypeGain: "Gain",
  contestedDetailVolatilityTooltip: "{party} - {type}: {probability}%",
  contestedDetailVolatilityError: "Volatility chart error: ",
  contestedDetailVolatilityNoData: "No volatility data available for this district/selection.",
  contestedDetailTitleTrend: "Trend vs 2024",
  contestedDetailTitleVolatility: "Volatility vs Modal",

  // District Map
  districtMapLegendLabel: "Leading Party",

  // Map Sidebar
  mapSidebarNoData: "No valid forecast data available to display.",
  mapSidebarChartError: "Error displaying chart.",
  mapSidebarDistrictTitle: "Vote Share Forecast:",
  mapSidebarNationalTitle: "National Vote Intention (Latest):",
  mapSidebarInstruction: "Click a district on the map for details.",
  mapSidebarTooltip: "{party}: {value}%",

  // Contested Heatstrip
  heatstripNoContestedData: "No contested seat data available for heatstrip.",
  heatstripNoSeats: "No seats found for heatstrip.",
  heatstripNoRanks: "Could not determine seat ranks.",
  heatstripTooltip: "District: {district}, Seat: {rank}, Flip Prob: {probability}%",
  heatstripLegendMin: "0%",
  heatstripLegendMax: "50% Flip",

  // Contested Heatmap
  heatmapNoContestedData: "No contested seat data available for heatmap.",
  heatmapNoSeats: "No seats found for heatmap after filtering/sorting.",
  heatmapTitle: "Contested Seats Heatmap (Flip Probability)",
  heatmapTooltip: "District: {district}, Seat: {rank}, Flip Prob: {probability}%",

  // OG Image specific
  ogHeroStatChance: "% chance",
  ogHeroStatCondition: "AD wins most seats",
  ogSubtitlePrefix: "Median seats –",
  ogSubtitlePartySeat: "{party} {seats}",
  ogFooter: "estimador.pt",

  // Poll Bias Section
  pollBiasUnavailable: "Poll bias data is currently unavailable.",
  pollBiasLegendOver: "Overestimated by polls",
  pollBiasLegendUnder: "Underestimated by polls",
  pollBiasLegendBalanced: "Balanced in polls",
  pollBiasTooltipPrefix: "Bias: ",

  // Party Names (basic, can be expanded)
  partyNames: {
    "AD": "AD",
    "PS": "PS",
    "CH": "CH",
    "IL": "IL",
    "BE": "BE",
    "CDU": "CDU",
    "L": "L",
    "PAN": "PAN",
    "OTH": "Others", // Example for 'Others'
    // Add more full names if desired, e.g. "Aliança Democrática"
  }
}; 