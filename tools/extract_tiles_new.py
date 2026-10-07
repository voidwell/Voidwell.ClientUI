## Credit to RoyAwesome for figuring out the .pack file format.
## Documentation on this format is in these comments at the top
##
## file is in big endian
##
## a pack file has several parts which are all identical in structure.
## there is no global header. not even magic
##
##
## START OF ONE PACK FILE PART
##
## metadata section (0x2000 bytes):
##	uint32: absolute offset for the next part of the pack file (end of current part)
##		if last pack part: 00000000
##	uint32: number of entries
##
##	strings prefixed with uint32 length, no trailing zero!
##	3 uint32 after the string
##		1 absolute offset (this can be in another pack part)
##		2 length
##		3 crc32 of the payload
##
##	padding so the section has 0x2000 bytes
##
##
## payload section (trivial)

from DbgPack import AssetManager
from pathlib import Path
from struct import unpack,pack
import sys, os, shutil, math, time, random, subprocess

# Output folder
output = sys.path[0] + "\\output\\"

# PlanetSide 2 installation assets folder
inputFolder = r"D:\SteamLibrary\SteamApps\common\PlanetSide 2\Resources\Assets"

# ImageMagick exe's
magick = r'C:\Program Files\ImageMagick\magick.exe'

# JPG quality
quality = str(65)

# List of continents to extract tiles for
continents = ['Amerish','Esamir','Hossin','Indar','Oshur']

def ps2int(num):
	negator=""
	if num < 0:
		negator="-"
	intstr=str(num)
	if len(intstr)==1:   return f'00{intstr}'
	elif len(intstr)==2: return f'{negator}0{abs(num)}'
	else:                return intstr

def zoneZoomDirName(outputStr, zoneNameStr, zoomLevelInt):
	return f'{outputStr}{zoneNameStr.lower()}\\zoom{zoomLevelInt}\\'

def tileFileName(outputStr, zoneNameStr, zoomLevelInt, xInt, yInt):
	return f'{zoneZoomDirName(outputStr,zoneNameStr,zoomLevelInt)}{zoneNameStr.lower()}_{zoomLevelInt}_{xInt}_{yInt}.jpg'

def montageTileArgumentStr(outputStr, zoneNameStr, zoomLevelInt, xInt, yInt):
	tile1 = tileFileName(outputStr, continent, zoomLevelInt, xInt, yInt)
	tile2 = tileFileName(outputStr, continent, zoomLevelInt, xInt+1, yInt)
	tile3 = tileFileName(outputStr, continent, zoomLevelInt, xInt, yInt+1)
	tile4 = tileFileName(outputStr, continent, zoomLevelInt, xInt+1, yInt+1)
	outputFilename = tileFileName(outputStr, zoneNameStr, zoomLevelInt-1, int(xInt/2), int(yInt/2))
	return f'-quality {quality} {tile1} {tile2} {tile3} {tile4} {outputFilename}'

# Create Zoom Level tiles
def createZoomTiles(outputStr, zoneNameStr, zoomLevelInt):
	print(f'\nCreating zoom level {zoomLevelInt} tiles for {zoneNameStr}')

	# Make zoom output folder
	zoomDir = zoneZoomDirName(outputStr, zoneNameStr, zoomLevelInt)
	if not os.path.exists(zoomDir):
		os.makedirs(zoomDir)

	# Create zoom tiles
	iterRange = 2 ** zoomLevelInt
	for x in range(-iterRange,iterRange, 2):
		for y in range(-iterRange,iterRange, 2):

			tileOutputStr = montageTileArgumentStr(outputStr, zoneNameStr, zoomLevelInt+1, x, y)

			print(".", end='')

			cmd = magick + " montage -geometry +0+0 -resize 256x256 -background none " + tileOutputStr
			subprocess.check_call(cmd)

class entry:
	pass

# Path checking
if not os.path.exists(inputFolder):
	print("PlanetSide 2 Assets folder does not exist: " + inputFolder)
	sys.exit()
if not os.path.exists(magick):
	print("ImageMagick magick.exe does not exist: " + magick)
	sys.exit()

# Loop thru continents
for continent in continents:
	# Delete and recreate output folder
	if os.path.exists(output + continent):
		print("\nDeleting output folder for " + continent)
		shutil.rmtree(output + continent)
		time.sleep(1)

	print(f'Loading pack for {continent}')

	filelist = []
	for x in range(-64, 64, 4):
		for y in range(-64, 64, 4):
			filelist.append(f'{continent}_Tile_{ps2int(x)}_{ps2int(y)}_LOD0.dds')

	globs = Path(inputFolder).glob(f'{continent}_*.pack2')
	current_manager = AssetManager(list(globs), filelist)

	print("\nExtracting zoom level 5 tiles for " + continent)

	# Zoom 5 output folder
	zoom5 = zoneZoomDirName(output, continent, 5)
	if not os.path.exists(zoom5):
		os.makedirs(zoom5)

	for x in range(-64, 64, 4):
		for y in range(-64, 64, 4):
			# Convert the tile coordinates
			ent = current_manager[f'{continent}_Tile_{ps2int(x)}_{ps2int(y)}_LOD0.dds']

			longitude = int(x/4)
			latitude = int((y * -1)/4 - 1)

			# Output filename (zoom level 5 is base zoom value)
			outputFilename = tileFileName(output, continent, 5, longitude, latitude)

			# Write temp DDS file
			tmp = zoom5 + ent.name.lower()
			dds=open(tmp,"wb")
			dds.write(ent.get_data())
			dds.close()

			# Convert to PNG
			cmd = magick + " convert " + tmp + " -flip -resize 256x256 -quality " + quality + " " + outputFilename
			subprocess.check_call(cmd)

			# Delete the temporary DDS file
			os.remove(tmp)

	# Create Zoom Level tiles
	for zoneLevel in range(4, 0, -1):
		createZoomTiles(output, continent, zoneLevel)