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

from struct import unpack,pack
import sys, os, shutil, math, time, random, subprocess

def ps2int(num):
	intstr=str(num)
	if len(intstr)==1:   return "00"+intstr
	elif len(intstr)==2: return"0"+intstr
	else:                return intstr

class entry:
	pass

# Output folder
output = sys.path[0] + "\\output\\"

# PlanetSide 2 installation assets folder
inputFolder = "S:\\SteamLibrary\\SteamApps\\common\\PlanetSide 2\\Resources\\Assets\\"

# ImageMagick exe's
convert = "C:\\ImageMagick\\convert.exe"
montage = "C:\\ImageMagick\\montage.exe"

# Path checking
if not os.path.exists(inputFolder):
	print("PlanetSide 2 Assets folder does not exist: " + inputFolder)
	sys.exit()
if not os.path.exists(convert):
	print("ImageMagick convert.exe does not exist: " + convert)
	sys.exit()
if not os.path.exists(montage):
	print("ImageMagick montage.exe does not exist: " + montage)
	sys.exit()

# JPG quality
quality = str(65)

# List of continents to extract tiles for
continents = ['amerish','esamir','hossin','indar']

# Loop thru continents
for continent in continents:
	# Delete and recreate output folder
	if os.path.exists(output + continent):
		print("Deleting output folder for " + continent)
		#shutil.rmtree(output + continent)
		time.sleep(1)

	print("\nExtracting zoom level 5 tiles for " + continent)

	# Zoom 5 output folder
	zoom5 = output + continent + "\\zoom5\\"
	if not os.path.exists(zoom5):
		os.makedirs(zoom5)

	ij=0
	while 1:
		partSize=1 #anything non-zero to make a do-while
		entrylist=[]
		fname=inputFolder+"Assets_"+ps2int(ij)+".pack"
		if not os.path.exists(fname):
			break
		pack = open(fname,"rb")
		while partSize:
			partSize=unpack(">I",pack.read(4))[0]
			numEntries=unpack(">I",pack.read(4))[0]
			for i in range(numEntries):
				ent=entry()
				stringlen=unpack(">I",pack.read(4))[0]
				ent.name=pack.read(stringlen)
				ent.offset,ent.size,ent.crc32=unpack(">III",pack.read(12))
				entrylist.append(ent)

			end=entrylist[-1].offset+entrylist[-1].size
			pack.seek(partSize)

		for ent in entrylist:
			pack.seek(ent.offset)
			pathinfo = os.path.splitext(ent.name)
			extension = pathinfo[1][1:].lower().decode()
			filename = pathinfo[0].lower().decode()

            
			# Find map tiles
			if extension == 'dds' and filename.find('_lod0') != -1 and filename.find(continent) != -1:
				print('.',)

				# Convert the tile coordinates
				fileparts = filename.replace('_lod0','').replace('_tile','').split('_')
				longitude = str(int(int(fileparts[1])/4))
				latitude = str(int((int(fileparts[2]) * -1)/4 - 1))

				# Output filename (zoom level 5 is base zoom value)
				outputFilename = continent + "_5_" + longitude + "_" + latitude + ".jpg"

				# Write temp DDS file
				tmp = zoom5 + ent.name.lower().decode()
				dds=open(tmp,"wb")
				dds.write(pack.read(ent.size))
				dds.close()

				# Convert to PNG
				cmd = convert + " " + tmp + " -flip -resize 256x256 -quality " + quality + " " + zoom5 + outputFilename
				os.system(cmd)

				# Delete the temporary DDS file
				os.remove(tmp)

		pack.close()
		ij+=1

	# Create Zoom Level 4 tiles
	print("\nCreating zoom level 4 tiles for " + continent)

	# Zoom 4 output folder
	zoom4 = output + continent + "\\zoom4\\"
	if not os.path.exists(zoom4):
		os.makedirs(zoom4)

	for x in range(-16,16, 2):
		for y in range(-16,16, 2):

			tile1 = zoom5 + continent + "_5_" + str(x) + "_" + str(y) + ".jpg"
			tile2 = zoom5 + continent + "_5_" + str(x+1) + "_" + str(y) + ".jpg"
			tile3 = zoom5 + continent + "_5_" + str(x) + "_" + str(y+1) + ".jpg"
			tile4 = zoom5 + continent + "_5_" + str(x+1) + "_" + str(y+1) + ".jpg"
			outputFilename = zoom4 + continent + "_4_" + str(int(x/2)) + "_" + str(int(y/2)) + ".jpg"

			print(".",)

			cmd = montage + " -geometry +0+0 -resize 256x256 -background none -quality " + quality + " " + tile1 + " " + tile2 + " " + tile3 + " " + tile4 + " " + outputFilename
			os.system(cmd)

	# Create Zoom Level 3 tiles
	print("\nCreating zoom level 3 tiles for " + continent)

	# Zoom 3 output folder
	zoom3 = output + continent + "\\zoom3\\"
	if not os.path.exists(zoom3):
		os.makedirs(zoom3)

	for x in range(-8,8, 2):
		for y in range(-8,8, 2):

			tile1 = zoom4 + continent + "_4_" + str(x) + "_" + str(y) + ".jpg"
			tile2 = zoom4 + continent + "_4_" + str(x+1) + "_" + str(y) + ".jpg"
			tile3 = zoom4 + continent + "_4_" + str(x) + "_" + str(y+1) + ".jpg"
			tile4 = zoom4 + continent + "_4_" + str(x+1) + "_" + str(y+1) + ".jpg"
			outputFilename = zoom3 + continent + "_3_" + str(int(x/2)) + "_" + str(int(y/2)) + ".jpg"

			print("."),

			cmd = montage + " -geometry +0+0 -resize 256x256 -background none -quality " + quality + " " + tile1 + " " + tile2 + " " + tile3 + " " + tile4 + " " + outputFilename
			os.system(cmd)

	# Create Zoom Level 2 tiles
	print("\nCreating zoom level 2 tiles for " + continent)

	# Zoom 2 output folder
	zoom2 = output + continent + "\\zoom2\\"
	if not os.path.exists(zoom2):
		os.makedirs(zoom2)

	for x in range(-4,4, 2):
		for y in range(-4,4, 2):

			tile1 = zoom3 + continent + "_3_" + str(x) + "_" + str(y) + ".jpg"
			tile2 = zoom3 + continent + "_3_" + str(x+1) + "_" + str(y) + ".jpg"
			tile3 = zoom3 + continent + "_3_" + str(x) + "_" + str(y+1) + ".jpg"
			tile4 = zoom3 + continent + "_3_" + str(x+1) + "_" + str(y+1) + ".jpg"
			outputFilename = zoom2 + continent + "_2_" + str(int(x/2)) + "_" + str(int(y/2)) + ".jpg"

			print("."),

			cmd = montage + " -geometry +0+0 -resize 256x256 -background none -quality " + quality + " " + tile1 + " " + tile2 + " " + tile3 + " " + tile4 + " " + outputFilename
			os.system(cmd)

	# Create Zoom Level 1 tiles
	print("\nCreating zoom level 1 tiles for " + continent)

	# Zoom 1 output folder
	zoom1 = output + continent + "\\zoom1\\"
	if not os.path.exists(zoom1):
		os.makedirs(zoom1)

	for x in range(-2,2, 2):
		for y in range(-2,2, 2):

			tile1 = zoom2 + continent + "_2_" + str(x) + "_" + str(y) + ".jpg"
			tile2 = zoom2 + continent + "_2_" + str(x+1) + "_" + str(y) + ".jpg"
			tile3 = zoom2 + continent + "_2_" + str(x) + "_" + str(y+1) + ".jpg"
			tile4 = zoom2 + continent + "_2_" + str(x+1) + "_" + str(y+1) + ".jpg"
			outputFilename = zoom1 + continent + "_1_" + str(int(x/2)) + "_" + str(int(y/2)) + ".jpg"

			print("."),

			cmd = montage + " -geometry +0+0 -resize 256x256 -background none -quality " + quality + " " + tile1 + " " + tile2 + " " + tile3 + " " + tile4 + " " + outputFilename
			os.system(cmd)
    
	# Create zoom level 0 tiles
	print("\nCreating zoom level 0 tiles for " + continent)

	# Zoom 0 output folder
	zoom0 = output + continent + "\\zoom0\\"
	if not os.path.exists(zoom0):
		os.makedirs(zoom0)
    
	# Create empty image that uses background color #051111
	empty = zoom0 + "empty.jpg"
	cmd = convert + " -resize 256x256 xc:#051111 -quality " + quality + " " + empty
	os.system(cmd)

	tile4 = zoom1 + continent + "_1_0_0.jpg"
	tile2 = zoom1 + continent + "_1_0_-1.jpg"
	tile3 = zoom1 + continent + "_1_-1_0.jpg"
	tile1 = zoom1 + continent + "_1_-1_-1.jpg"
    
	outputFilename = zoom0 + continent + "_0_0_0.jpg"
	cmd = montage + " -geometry +0+0 -background none -quality " + quality + " " + tile1 + " " + tile2 + " " + tile3 + " " + tile4 + " " + outputFilename
	os.system(cmd)

	os.remove(empty)
