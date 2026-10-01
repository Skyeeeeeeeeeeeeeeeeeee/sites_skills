# Photo sources

All photos are Unsplash stock (https://unsplash.com/license: free to use, attribution appreciated), downloaded from images.unsplash.com at 2400 px wide.

Every file was then processed the same way with ffmpeg (a uniform "night" grade so stock reads as one shoot):

- cropped to 16:10 (911-gt3 and range-rover cropped tighter around the car) and scaled to 1920x1200 (garage.jpg keeps its 1.72 ratio);
- licence plates and a photographer's sticker blurred (boxblur over the plate region);
- the upper frame darkened progressively (sky and background), contrast up, saturation 0.5, highlights crushed;
- shadows pushed cool, highlights pushed warm (sodium streetlight), vignette.

| File | Model shown | Unsplash source |
|---|---|---|
| wraith.jpg | Rolls-Royce Wraith | https://images.unsplash.com/photo-1631295868223-63265b40d9e4 |
| dawn.jpg | Rolls-Royce Dawn | https://images.unsplash.com/photo-1599912027611-484b9fc447af |
| m760li.jpg | BMW 7 Series (M760Li) | https://images.unsplash.com/photo-1601362840469-51e4d8d58785 |
| panamera.jpg | Porsche Panamera Turbo | https://images.unsplash.com/photo-1503376780353-7e6692767b70 |
| g63.jpg | Mercedes-AMG G 63 | https://images.unsplash.com/photo-1520031441872-265e4ff70366 |
| range-rover.jpg | Range Rover | https://images.unsplash.com/photo-1563720360172-67b8f3dce741 |
| huracan.jpg | Lamborghini Huracán Performante Spyder | https://images.unsplash.com/photo-1580414057403-c5f451f30e1c |
| 911-gt3.jpg | Porsche 911 GT3 | https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e |
| garage.jpg | Workshop interior at night | https://images.unsplash.com/photo-1486006920555-c77dcf18193c |

These photos show the same models as the demo fleet, not the business's actual cars. Replace them with real fleet photography before launch.
