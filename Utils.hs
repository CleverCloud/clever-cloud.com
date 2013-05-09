module Utils where

import Data.List (intercalate)

splitOn :: (a -> Bool) -> [a] -> [[a]]
splitOn _ [] = []
splitOn f l@(x:xs)
  | f x = splitOn f xs
  | otherwise = let (h,t) = break f l in h:(splitOn f t)

replace :: (Eq a) => a -> [a] -> [a] -> [a]
replace old new = intercalate new . splitOn (==old)
